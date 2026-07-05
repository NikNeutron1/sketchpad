import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { IPoint2D } from 'src/app/sketchpad/model/types';

export type ISketchAction = {
  colorIndex: number;
  lineWidth: number;
  mouse: IPoint2D;
  lastMouse: IPoint2D;
}[];

@Component({
  selector: 'app-heartbeat',
  templateUrl: './heartbeat.component.html',
  styleUrls: ['./heartbeat.component.scss'],
})
export class HeartbeatComponent implements OnInit, AfterViewInit, OnDestroy {
  point: IPoint2D;
  ngOnInit(): void {}
  ngAfterViewInit(): void {}
  ngOnDestroy(): void {}
}
