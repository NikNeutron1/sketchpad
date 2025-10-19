import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-resize-vertical',
  templateUrl: './resize-vertical.component.html',
  styleUrls: ['./resize-vertical.component.scss'],
})
export class ResizeVerticalComponent {
  @Input()
  height: number;

  @Output()
  changed = new EventEmitter<number>();

  mousedown = false;

  lastHeight = 0;
  lastY = 0;

  onMouseDown(event: MouseEvent) {
    this.mousedown = true;
    this.lastY = event.clientY;
    this.lastHeight = this.height;
  }

  onMouseMove(event: MouseEvent) {
    const delta = event.clientY - this.lastY;
    const width = this.lastHeight + delta;
    this.changed.next(width);
  }

  onMouseUp(evnt: MouseEvent) {
    this.mousedown = false;
  }

  onMouseLeave(event: MouseEvent) {
    this.onMouseUp(event);
  }

  onMouseEnter(event: MouseEvent) {}

  onTouchDown(event: TouchEvent) {
    this.mousedown = true;
    this.lastY = event.touches[0].clientY;
    this.lastHeight = this.height;
  }
  onTouchMove(event: TouchEvent) {
    const delta = event.touches[0].clientY - this.lastY;
    const width = this.lastHeight + delta;
    this.changed.next(width);
    event.preventDefault();
  }
  onToucheUp(event: TouchEvent) {
    this.mousedown = false;
  }
}
