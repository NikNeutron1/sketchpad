import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ArrayUtils } from 'src/app/sketchpad/model/util/ArrayUtils';

export interface IWave {
  t0: number; // miliseconds
  speed: number; // light per second
  spawnPos: number;
  width: number; // lights
  brigthness: number;
  direction: 'E' | 'W' | 'EW';
}

export interface IBackgroundWave {
  wave: IWave;
  keyFrames: Array<{ dt: number; level: number }>;
}

export interface ILight {
  index: number;
  x: number; // integer -7 bis +7
  gpPin: 0;
  level: number; // 0 bis 1
  right?: boolean;
}

export interface IRecording {
  t_end: number;
  waves: IWave[];
  wavesBg: IBackgroundWave[];
  isPlaying: boolean;
}

export interface ISignalRyhtm {
  t0: number;
  dt1_blink_1_start: number;
  dt2_blink_1_end: number;
  dt3_blink_2_start: number;
  dt4_blink_2_end: number;
}

type IDeviceOptions = { color: string } | { colors: string[] };
export class Device {
  constructor(
    public name: string,
    public lights: ILight[],
    public options: IDeviceOptions,
  ) {}
  getColor(light: ILight) {
    if ('color' in this.options) {
      return this.options.color;
    } else {
      return this.options.colors[this.lights.indexOf(light)];
    }
  }
}

@Component({
  selector: 'app-heartbeat',
  templateUrl: './heartbeat.component.html',
  styleUrls: ['./heartbeat.component.scss'],
})
export class HeartbeatComponent implements OnInit, OnDestroy {
  lights: ILight[] = ArrayUtils.range(14).map((index) => ({
    index,
    x: index - 5,
    right: index === 5,
    gpPin: 0,
    level: 0.2,
  }));

  devices: Device[] = [
    new Device(
      'Marci',
      ArrayUtils.range(8).map((index) => ({
        index,
        x: index - 3,
        right: index === 3,
        gpPin: 0,
        level: 0.2,
      })),
      {
        color: 'Aqua',
      },
    ),
  ];

  // deep pink

  waves: IWave[] = [];

  backgroundWaves: IBackgroundWave[] = [];

  private animationFrameId: number | null = null;

  speedThreshold: number = 1000;

  settings: {
    [key in 'speed' | 'default' | 'out']: Partial<{
      directions: IWave['direction'][];
      spawnPos: number[];
      speeds: number[];
      brigthness: number[];
      widths: number[];
    }>;
  } = {
    speed: {
      directions: ['E', 'E', 'W', 'W'],
      spawnPos: [4, 0, 0, 4],
      speeds: [8],
      brigthness: [0.5],
    },
    default: {
      speeds: [7, 8, 5, 2],
      brigthness: [1],
      spawnPos: [0, 0, 0, 4, 0, 4, 0],
      widths: [5],
      directions: ['EW'],
    },
    out: {
      speeds: [5],
      widths: [3.5],
    },
  };

  lastPointerDown: number = 0;
  lastPointerUp: number = 0;

  longPressedThreshold = 1000;

  currentSignal: ISignalRyhtm;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // 1. Kick off the loop outside Angular so it doesn't cause lag
    this.ngZone.runOutsideAngular(() => {
      this.loop();
    });
  }

  ngOnDestroy() {
    // Clean up the loop when the component leaves the DOM to prevent memory leaks
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  counterLoops = 0;

  recording: IRecording = null;

  private loop = () => {
    // 2. Perform your calculations
    this.render();

    if (this.counterLoops++ % 200 === 0) {
      this.cleanup();
    }

    if (
      this.lastPointerDown &&
      Date.now() > this.lastPointerDown + this.longPressedThreshold 
      && this.recording 
      && !this.recording.isPlaying
    ) {
      this.lastPointerDown = null;
      this.recording.isPlaying = true;
      this.recording.t_end = Date.now();
    } else if (
      this.lastPointerDown &&
      Date.now() > this.lastPointerDown + this.longPressedThreshold 
      && !this.recording
      && !this.currentSignal 
    ) {
      this.lastPointerDown = null;
      this.currentSignal = {
        t0: Date.now(),
        dt1_blink_1_start: 200 * 1,
        dt2_blink_1_end: 200 * 2,
        dt3_blink_2_start: 200 * 3,
        dt4_blink_2_end: 200 * 4,
      };
      this.recording = {
        t_end: null,
        waves: [],
        wavesBg: [],
        isPlaying: false,
      };
    }

    // 3. Manually tell Angular to update the DOM for this specific component
    this.cdr.detectChanges();

    // 4. Request the next frame (targeting 60fps)
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  handleMouseUp($event: PointerEvent) {
    const lastPointerDown = this.lastPointerDown;
    this.lastPointerUp = Date.now();
    this.lastPointerDown = null;

    if (this.lastPointerUp - lastPointerDown >= this.longPressedThreshold) {
      // play loop
    }
  }

  counter = 0;

  handleMouseDown($event: PointerEvent) {
    this.lastPointerDown = Date.now();

    const counter = this.counter++;
    const { spawnPos, speeds, widths, directions, brigthness } = this.settings.default;
    const getByCounter: <T>(arr: T[], counter?: number) => T = (arr, counter = this.counter) => {
      return arr[counter % arr.length];
    };
    const wave: IWave = {
      t0: Date.now(),
      spawnPos: getByCounter(spawnPos),
      speed: getByCounter(speeds),
      width: getByCounter(widths),
      brigthness: getByCounter(brigthness),
      direction: getByCounter(directions),
    };

    const lastWave = this.waves.length && this.waves[this.waves.length - 2];
    const speedWave = lastWave && Date.now() - lastWave.t0 < this.speedThreshold;
    if (speedWave) {
      const { spawnPos, speeds, directions, brigthness } = this.settings.speed;
      lastWave.direction = getByCounter(directions, counter - 1);
      lastWave.brigthness = getByCounter(brigthness);
      wave.direction = getByCounter(directions);
      wave.spawnPos = getByCounter(spawnPos);
      wave.speed = getByCounter(speeds);
    }

    if (
      (wave.spawnPos <= 0 && wave.direction === 'W') ||
      (wave.spawnPos >= 4 && wave.direction === 'E')
    ) {
      wave.speed = getByCounter(this.settings.out.speeds);
      wave.width = getByCounter(this.settings.out.widths);
    }

    this.waves.push(wave);

    const backgroundOn = !speedWave;
    let waveBg: IBackgroundWave = null;
    if (backgroundOn && wave.spawnPos === 0) {
      waveBg = {
        wave,
        keyFrames: [
          { dt: 0, level: 0.22 },
          { dt: 1, level: 0.22 },
          { dt: 1_000, level: 0.22 },
          { dt: 2_000, level: 0.2 },
          { dt: 6_000, level: 0.1 },
          { dt: 10_000, level: 0 },
        ],
      };
      this.backgroundWaves.push(waveBg);
    }

    if (this.recording) {
      this.recording.waves.push(wave);
      this.recording.wavesBg.push(waveBg);
    }

    if (this.recording && this.recording.isPlaying) {
      this.recording = null;
    }

    // console.log(this.waves);
  }

  render() {
    let globalLevel = 0;
    if (this.currentSignal) {
      const { t0, dt1_blink_1_start, dt2_blink_1_end, dt3_blink_2_start, dt4_blink_2_end } =
        this.currentSignal;
      const now = Date.now();
      if (t0 + dt4_blink_2_end < now) {
        this.currentSignal = null;
      } else if (t0 + dt3_blink_2_start < now) {
        globalLevel = 1;
      } else if (t0 + dt2_blink_1_end < now) {
        globalLevel = 0;
      } else if (t0 + dt1_blink_1_start < now) {
        globalLevel = 1;
      }
    }
    let waves = this.waves;
    let wavesBg = this.backgroundWaves;
    if (this.recording && this.recording.isPlaying && this.recording.waves.length) {
      const w0 = this.recording.waves[0];
      const t0 = w0.t0;
      const dtRecording = this.recording.t_end - t0;
      const now = Date.now();
      const dtTotal = now - t0;
      const numLoops = Math.floor(dtTotal / dtRecording);
      const percentageTime = dtTotal / dtRecording - numLoops;
      waves = this.recording.waves.map(wave => ({
        ...wave,
        t0: numLoops * dtRecording + wave.t0
      }));
      /*wavesBg = this.recording.wavesBg.map(waveBg => ({
        ...waveBg,
        wave: {
          ...waveBg.wave,
          t0: waveBg.wave.t0 - 
        }
      }));*/
    }
    this.lights.forEach((light) => {
      const maxWaveValue = waves.reduce((_max, wave) => {
        const current = this.calcWave(light, wave);
        return Math.max(current, _max);
      }, 0);
      const maxWaveBgValue = wavesBg.reduce((_max, wave) => {
        const current = this.calcWaveBackground(light, wave);
        return Math.max(current, _max);
      }, 0);
      light.level = Math.max(maxWaveValue, maxWaveBgValue);
      if (this.currentSignal) {
        light.level = globalLevel;
      }
    });
  }

  cleanup() {
    const waves = this.waves.filter(
      (wave) =>
        Date.now() - wave.t0 < 1000 ||
        this.lights.some((light) => {
          const { east, west } = this.intersectsWave(light, wave, Date.now());
          return east || west;
        }),
    );
    this.waves.length = 0;
    this.waves.push(...waves);
    //console.log('cleanup', this.waves.length);
  }

  intersectsWave(light: ILight, wave: IWave, now: number): typeof result {
    const hasEast = wave.direction.includes('E');
    const hasWest = wave.direction.includes('W');
    const spawnAt = wave.spawnPos;
    let xEast = light.x;
    let xWest = light.x;
    let dt = (now - wave.t0) / 1000.0;
    let dtEast = dt;
    if (light.x < wave.spawnPos && hasEast) {
      dtEast = dt + 1 / wave.speed;
    }

    const traveled = dt * wave.speed;
    const traveledEast = dtEast * wave.speed;
    const wavePeakEast = spawnAt + traveledEast;
    const wavePeakWest = spawnAt - traveled;
    const waveEndEast = wavePeakEast - wave.width;
    const waveEndWest = wavePeakWest + wave.width;

    const east = hasEast && xEast >= wave.spawnPos && xEast <= wavePeakEast && xEast >= waveEndEast;
    const west = hasWest && xWest <= wave.spawnPos && xWest >= wavePeakWest && xWest <= waveEndWest;

    const result = {
      east,
      west,
      waveEndEast,
      wavePeakEast,
      waveEndWest,
      wavePeakWest,
      xEast,
      xWest,
      traveled,
    };
    return result;
  }

  calcWaveBackground(light: ILight, waveBg: IBackgroundWave, now = Date.now()): number {
    const { east, west, wavePeakEast, wavePeakWest, xEast, xWest } = this.intersectsWave(
      light,
      waveBg.wave,
      now,
    );

    const lastKeyframe = waveBg.keyFrames
      .filter((frame) => waveBg.wave.t0 + frame.dt <= now)
      .reduce((aggr, v) => (v.dt > (aggr?.dt ?? 0) ? v : aggr), null);

    if (!lastKeyframe) {
      return 0;
    }
    const lastIndex = waveBg.keyFrames.indexOf(lastKeyframe);
    if (lastIndex < 1) {
      return 0;
    }
    const keyFrameBefore = waveBg.keyFrames[lastIndex - 1];
    const levelBefore = keyFrameBefore.level;
    const levelAfter = lastKeyframe.level;

    const tWaveStarted = waveBg.wave.t0 + lastKeyframe.dt;
    if (tWaveStarted > Date.now()) {
      return 0;
    }

    const dt = Date.now() - tWaveStarted;
    const traveled = (dt / 1000.0) * waveBg.wave.speed;

    const isEast =
      waveBg.wave.direction.includes('E') &&
      waveBg.wave.spawnPos <= light.x &&
      wavePeakEast >= light.x;
    if (isEast) {
      const bgPivot = waveBg.wave.spawnPos + traveled;
      const isBehindWave = bgPivot >= light.x;
      return isBehindWave ? levelAfter : levelBefore;
    }

    const isWest =
      waveBg.wave.direction.includes('W') &&
      waveBg.wave.spawnPos >= light.x &&
      wavePeakWest <= light.x;
    if (isWest) {
      const bgPivot = waveBg.wave.spawnPos - traveled;
      const isBehindWave = bgPivot <= light.x;
      return isBehindWave ? levelAfter : levelBefore;
    }
    return 0;
  }

  calcWave(light: ILight, wave: IWave, now = Date.now()): number {
    let result = 0;
    const { east, west, wavePeakEast, wavePeakWest, xEast, xWest, traveled } = this.intersectsWave(
      light,
      wave,
      now,
    );
    const distance = east ? xEast - wavePeakEast : west ? wavePeakWest - xWest : wave.width;
    const ratio = Math.max(0, distance) / wave.width;
    const fade = east || west ? Math.max(0, 1 - Math.max(traveled / 10, 0.2)) : 1;
    result = (1 - Math.max(ratio, 0)) * fade;
    return result * wave.brigthness;
  }
}
