import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { IPoint2D } from 'src/app/sketchpad/model/types';
import { ArrayUtils } from 'src/app/sketchpad/model/util/ArrayUtils';

export interface IWave {}

export interface ILight {
  x: number; // integer -7 bis +7
  gpPin: 0;
}

@Component({
  selector: 'app-heartbeat',
  templateUrl: './heartbeat.component.html',
  styleUrls: ['./heartbeat.component.scss'],
})
export class HeartbeatComponent {
  lights: ILight[] = ArrayUtils.range(7 * 2).map((index) => ({
    x: index - 6,
    gpPin: 0,
  }));
}
