import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { IRecording, IWave } from '../heartbeat/heartbeat.component';

@Component({
  selector: 'app-recording-graph',
  templateUrl: './recording-graph.component.html',
  styleUrls: ['./recording-graph.component.scss'],
})
export class RecordingGraphComponent implements OnInit, OnDestroy {
  @ViewChild('containerRecording', { static: false })
  containerRecording!: ElementRef<HTMLDivElement>;

  @Input()
  recording: IRecording = null;

  waveSpikes: { timePercentage: number; wave: IWave }[] = [];

  private animationFrameId: number | null = null;

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

  private loop = () => {
    // 2. Perform your calculations
    this.render();

    // 3. Manually tell Angular to update the DOM for this specific component
    this.cdr.detectChanges();

    // 4. Request the next frame (targeting 60fps)
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  render() {
    if (!this.recording || !this.recording.waves.length) {
      return;
    }
    const t0 = this.recording.waves[0].t0;
    const tn = this.recording.t_end ?? Date.now();
    this.waveSpikes = this.recording.waves.map((wave) => ({
      timePercentage: (wave.t0 - t0) / (tn - t0),
      wave,
    }));
  }

  getCurrenTimePercentage(val = 0): number {
    if (!this.recording || !this.recording.waves.length) {
      return 0;
    }
    const now = Date.now();
    const t0Recording = this.recording.waves[0].t0;
    const dtRecording = this.recording.t_end - t0Recording;
    const dtTotal = now - t0Recording;
    const loops = Math.floor(dtTotal / dtRecording);
    const timePercentage = dtTotal / dtRecording - loops;
    if (val) {
      return timePercentage <= 0.5 ? 0.5 + timePercentage : timePercentage - 0.5;
    }
    return timePercentage;
  }

  getTime(): typeof result {
    if (!this.recording || !this.recording.waves.length) {
      return { dtRecording: '', now: '' };
    }

    const now = Date.now();
    const t0Recording = this.recording.waves[0].t0;
    const dtRecording = this.recording.t_end - t0Recording;
    const dtTotal = now - t0Recording;
    const loops = Math.floor(dtTotal / dtRecording);
    const timePercentage = dtTotal / dtRecording - loops;

    const formatter = new Intl.DateTimeFormat('en-US', {
      minute: '2-digit',
      second: '2-digit',
      hour: undefined, // Only show hours if needed
      hour12: false,
      timeZone: 'UTC',
      fractionalSecondDigits: 3,
    });

    // 3. Format the duration object
    //  return ;

    const result = {
      dtRecording: formatter.format(new Date(dtRecording)),
      now: formatter.format(new Date(timePercentage * dtRecording)),
    };
    return result;
  }
}
