import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ILight, ILoopRun, IRecording, IWave } from '../heartbeat/model/heartbeat.types';
import { HeartbeatService } from '../heartbeat/serivce/heartbeat.service';

@Component({
  selector: 'app-recording-graph',
  templateUrl: './recording-graph.component.html',
  styleUrls: ['./recording-graph.component.scss'],
})
export class RecordingGraphComponent implements OnInit, OnDestroy {
  @ViewChild('svg', { static: false })
  svgElement: ElementRef<HTMLDivElement>;

  @Input()
  lanes: {
    live: ILoopRun;
    swap: ILoopRun;
    busy: ILoopRun;
  } = null;

  @Input()
  loopOn = false;

  @Input()
  recordingOn = false;

  svgWidth = 0;
  svgHeight = 0;

  private animationFrameId: number | null = null;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private readonly heartbeatService: HeartbeatService,
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

  private loop = () => {
    // 2. Perform your calculations
    this.render();

    // 3. Manually tell Angular to update the DOM for this specific component
    this.cdr.detectChanges();

    // 4. Request the next frame (targeting 60fps)
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  render() {
    if (this.svgElement?.nativeElement) {
      const element = this.svgElement.nativeElement;
      const rect = element.getBoundingClientRect();
      this.svgWidth = rect.width;
      this.svgHeight = rect.height;
    }
  }

  isActive(wave: IWave, loop: ILoopRun): boolean {
    if (!this.loopOn) {
      return false;
    }
    const { t0_rec, dt_now } = this.heartbeatService.extractTime(loop);
    const { intersectsEast, intersectsWest } = this.heartbeatService.intersectsWave(
      wave.spawnPos,
      wave,
      t0_rec + dt_now,
    );
    return intersectsEast || intersectsWest;
  }

  getPointList(
    wave: IWave,
    loop: ILoopRun,
  ): { west: string; east: string; eastBg: string; westBg: string } {
    const width = this.svgWidth;

    const factor = this.svgHeight / 200;
    const y0 = 100 * factor + wave.spawnPos * 10 * factor;
    const sizeAmplitude = 20 * factor;

    const { dt_now, dt_rec, t0_rec, tn_rec, num_lapsed_loops } =
      this.heartbeatService.extractTime(loop);

    const tn = this.loopOn ? tn_rec : Date.now();
    const dt_rec2 = tn - t0_rec;

    const now = Date.now();

    const t0_wave = wave.t0;
    const tn_wave = wave.bgKeyFrames[wave.bgKeyFrames.length - 1].dt + t0_wave;
    const dt_wave = tn_wave - t0_wave;

    const timePerPixel = dt_rec / width;

    const x0 = (width * (t0_wave - t0_rec)) / dt_rec2;
    const xn = (width * (tn_wave - t0_rec)) / dt_rec2;
    const arr_y = [];

    var eastPoly = `${x0},${y0} `;
    var westPoly = `${x0},${y0} `;
    var eastPolyBg = `${x0},${y0} `;
    var westPolyBg = `${x0},${y0} `;
    var closed = { eastPoly: false, westPoly: false };
    for (var x = x0; x < xn && x < width; x += 16) {
      const time = (dt_rec2 * x) / width;

      // lightX >= wave.spawnPos && hasWest
      const spawnPos = wave.direction === 'W' ? wave.spawnPos : wave.spawnPos;

      const level = this.heartbeatService.calcWave(spawnPos, wave, time + t0_rec, {
        wave: true,
        bg: false,
      });
      const levelBg = this.heartbeatService.calcWave(spawnPos, wave, time + t0_rec, {
        wave: false,
        bg: true,
      });

      const { intersectsEast, intersectsWest } = this.heartbeatService.intersectsWave(
        wave.spawnPos,
        wave,
        time + t0_rec,
      );
      const intersects = intersectsEast || intersectsWest;

      if (isNaN(x)) {
        console.log({ x, level, spawnPos });
      }

      if (intersects) {
        eastPoly += `${x},${level * sizeAmplitude + y0} `;
        westPoly += `${x},${-(level * sizeAmplitude) + y0} `;
      }
      if (!intersects && !closed.eastPoly) {
        eastPoly += `${x},${y0} `;
        closed.eastPoly = true;
      }
      if (!intersects && !closed.westPoly) {
        westPoly += `${x},${y0} `;
        closed.westPoly = true;
      }

      eastPolyBg += `${x},${levelBg * sizeAmplitude + y0} `;
      westPolyBg += `${x},${-(levelBg * sizeAmplitude) + y0} `;
    }
    eastPolyBg += `${xn},${y0} `;
    westPolyBg += `${xn},${y0} `;

    //console.log(polyText);

    return {
      east: wave.direction.includes('E') ? eastPoly : '',
      west: wave.direction.includes('W') ? westPoly : '',
      eastBg: wave.direction.includes('E') ? eastPolyBg : '',
      westBg: wave.direction.includes('W') ? westPolyBg : '',
    };
  }

  getPayheadPosition(): number {
    if (!this.lanes?.live.waves.length) {
      return 0;
    }
    const { t0_rec, dt_rec, num_lapsed_loops, dt_now, tn_rec } = this.heartbeatService.extractTime(
      this.lanes.live,
    );

    const x = (this.svgWidth * dt_now) / dt_rec;

    return x;
  }

  trackByWaveId(index: number, wave: IWave): any {
    return wave.spawnPos + wave.direction + wave.t0;
  }

  private formatSeconds(delta_millis: number): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
      minute: '2-digit',
      second: '2-digit',
      hour: undefined, // Only show hours if needed
      hour12: false,
      timeZone: 'UTC',
      fractionalSecondDigits: 3,
    });
    return formatter.format(new Date(delta_millis));
  }

  getTime(): typeof result {
    if (!this.lanes?.live.waves.length) {
      return { dtRecording: '', now: '' };
    }

    const now = Date.now();

    const { t0_rec, tn_rec, dt_rec } = this.heartbeatService.extractTime(this.lanes.live);
    if (!dt_rec) {
      return {
        dtRecording: '00:00:000',
        now: '00:00:000',
      };
    }

    const dtTotal = now - t0_rec;
    const loops = Math.floor(dtTotal / dt_rec);
    const timePercentage = dtTotal / dt_rec - loops;

    const result = {
      dtRecording: this.formatSeconds(dt_rec),
      now: this.formatSeconds(timePercentage * dt_rec),
    };
    return result;
  }
}
