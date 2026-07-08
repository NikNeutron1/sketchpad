import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import {
  BeatClickerDevice,
  ReclickerDevice,
  IWave,
  ISignalRyhtm,
  IReclickerLightMapping,
  ILoopRun,
} from './model/heartbeat.types';
import { HeartBeatSetup } from './model/heartbeat-setup';
import { HeartbeatService } from './serivce/heartbeat.service';
import { HeartBeatSettings } from './serivce/heartbeat.settings';

/**  namen-ideen
  light maker mobile
  light razer
  light instrument / music ligths
  button entodrum
  knopf-
  beat-clicker
  click-receiver
  click-spiegel
  click-replica
  reclicker
*/

@Component({
  selector: 'app-heartbeat',
  templateUrl: './heartbeat.component.html',
  styleUrls: ['./heartbeat.component.scss'],
})
export class HeartbeatComponent implements OnInit, OnDestroy {
  beatclickers: BeatClickerDevice[] = HeartBeatSetup.beatclickers;
  reclickers: ReclickerDevice[] = HeartBeatSetup.reclickers;

  labels = {
    id: false,
    name: false,
    x: false,
    index: false,
    gp: false,
  };

  loopOn = false;
  recordingOn = false;

  lanes: {
    live: ILoopRun;
    swap: ILoopRun;
    busy: ILoopRun;
  } = {
    live: { waves: [] },
    swap: { waves: [] },
    busy: { waves: [] },
  };

  private animationFrameId: number | null = null;

  speedThreshold: number = 1000;

  lastPointerDown: number = 0;
  lastPointerUp: number = 0;

  longPressedThreshold = 1000;

  currentSignal: ISignalRyhtm;

  counter = 0;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private heartbeatservice: HeartbeatService,
  ) {
    this.init();
  }

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      this.loop();
    });
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private init() {
    const mapping: IReclickerLightMapping = {
      'RC-0': new Int8Array([-7, -6, -5]),
      'RC-1': new Int8Array([-4, -3, -2]),
      'RC-2': new Int8Array([-1, 0, +1]),
      'RC-3': new Int8Array([+2, +3, +4]),
      'RC-4': new Int8Array([+5, +6, +7]),
    };
    this.reclickers.forEach((reclicker) => reclicker.assign(mapping));
  }

  onButtonDown($event: PointerEvent) {
    this.lastPointerDown = Date.now();

    if (this.lanes.live.waves.length === 0) {
      this.counter = -1;
    }

    this.counter++;

    const wave: IWave = {
      ...this.spawnWave(this.counter),
      bgKeyFrames: HeartBeatSettings.getBackgroundKeyFrames(this.recordingOn),
    };

    if (!this.recordingOn && this.loopOn) {
      this.loopOn = false;
      this.lanes.live.waves = [];
      this.lanes.busy.waves = [];
    }

    if (this.recordingOn && this.currentSignal) {
      this.currentSignal = null;
    }

    this.lanes.live.waves.push(wave);
  }

  onButtonUp($event: PointerEvent) {
    const lastPointerDown = this.lastPointerDown;
    this.lastPointerUp = Date.now();
    this.lastPointerDown = null;

    if (this.lastPointerUp - lastPointerDown >= this.longPressedThreshold) {
      // play loop
    }

    const wave: IWave = {
      ...this.spawnWave(this.counter),
      bgKeyFrames: [
        { dt: 0, level: 0.22 },
        { dt: 1, level: 0.1 },
        { dt: 1_200, level: 0.1 },
        { dt: 1_700, level: 0 },
      ],
    };

    if (!this.currentSignal && !this.loopOn) {
      this.lanes.live.waves.push(wave);
    }
  }

  private spawnWave(counter: number): IWave {
    const { spawnPos, speeds, widths, directions, brigthness } =
      HeartBeatSettings.getSettings().default;
    const getByCounter: <T>(arr: T[], c?: number) => T = (arr) => {
      return arr[counter % arr.length];
    };
    return {
      t0: Date.now(),
      spawnPos: getByCounter(spawnPos),
      speed: getByCounter(speeds),
      width: getByCounter(widths),
      brigthness: getByCounter(brigthness) * 0.5,
      direction: getByCounter(directions),
      bgKeyFrames: [],
    };
  }

  private loop = () => {
    this.animate();

    if (!this.loopOn && !this.recordingOn) {
      this.heartbeatservice.cleanupLoop(this.lanes.live);
    }

    const now = Date.now();
    const isPressedDown = !!this.lastPointerDown;
    const isLongPressed = isPressedDown && now > this.lastPointerDown + this.longPressedThreshold;
    // End Recording
    if (isPressedDown && isLongPressed && this.recordingOn && !this.loopOn) {
      // this.recording.t_end = this.lastPointerDown;
      this.lastPointerDown = null;
      this.loopOn = true;
      this.recordingOn = false;

      let loop = this.lanes.live;
      loop = this.heartbeatservice.swapHalfs(loop);
      loop = this.heartbeatservice.moveAxis(loop, -2);
      this.lanes.busy = loop;
      console.log('busy', loop, this.lanes.live);
    }
    // Pulse and Wait for Recording
    else if (isPressedDown && isLongPressed && !this.recordingOn && !this.currentSignal) {
      this.lastPointerDown = null;
      this.currentSignal = {
        t0: Date.now(),
        dt1_blink_1_start: 200 * 1,
        dt2_blink_1_end: 200 * 2,
        dt3_blink_2_start: 200 * 3,
        dt4_blink_2_end: 200 * 4,
      };
      this.recordingOn = true;
      this.lanes.live.waves = [];
    }

    // 3. Manually tell Angular to update the DOM for this specific component
    this.cdr.detectChanges();

    // 4. Request the next frame (targeting 60fps)
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  toLoopRun(device: BeatClickerDevice | ReclickerDevice, recording: ILoopRun): ILoopRun {
    let loop = this.heartbeatservice.resetCycle(recording);

    if (device.type === 'Reclicker') {
      const loop_x0 = this.heartbeatservice.mirrorDirections(loop);
      // const loop_x1 = this.heartbeatservice.moveAxis(loop, - 7);
      //loop = loop_x0; // this.heartbeatservice.mergeLoops(loop_x1, loop);
    }

    if (device.type === 'BeatClicker' && device.lights.length < 10) {
      //loop = this.heartbeatservice.swapHalfs(loop);
    }

    loop = this.heartbeatservice.padStart(loop);

    return loop;
  }

  animate() {
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

    let loopMain = this.lanes.live;

    // let loopSwap = loopMain.waves.length < 2 ? { waves: []} : this.heartbeatservice.swapHalfs(loopMain);
    // this.lanes.swap = loopSwap
    let loopMirror = this.heartbeatservice.mirror(loopMain);
    this.lanes.swap = loopMirror;

    const clickers = [...this.beatclickers, ...this.reclickers];
    clickers.forEach((device) => {
      // let loop = device.lights.length < 10 ? loopSwap : loopMain;
      let loop = device.lights.length < 10 ? loopMirror : loopMain;

      if (this.loopOn && device.type === 'Reclicker') {
        loop = this.lanes.busy;
      }

      if (!this.recordingOn && this.loopOn && loop.waves.length) {
        loop = this.heartbeatservice.resetCycle(loop);
        loop = this.heartbeatservice.padStart(loop);
      }

      device.lights.forEach((light) => {
        light.level = loop.waves.reduce(
          (max, wave) => Math.max(this.heartbeatservice.calcWave(light.x, wave), max),
          0,
        );

        if (this.currentSignal) {
          light.level = globalLevel;
        }
      });
    });
  }
}
