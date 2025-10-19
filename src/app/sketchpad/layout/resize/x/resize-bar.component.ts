import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-resize-bar',
  templateUrl: './resize-bar.component.html',
  styleUrls: ['./resize-bar.component.scss'],
})
export class ResizeBarComponent {
  @Input()
  width: number;

  @Output()
  changed = new EventEmitter<number>();

  mousedown = false;

  lastWidth = 0;
  lastX = 0;

  onMouseDown(event: MouseEvent) {
    this.mousedown = true;
    this.lastX = event.clientX;
    this.lastWidth = this.width;
  }

  // @HostListener('document:touchmove', ['$event'], { passive: false })
  onMouseMove(event: MouseEvent) {
    const delta = event.clientX - this.lastX;
    const width = this.lastWidth + delta;
    this.changed.next(width);
  }

  onMouseUp(evnt: MouseEvent) {
    this.mousedown = false;
  }

  onTouchDown(event: TouchEvent) {
    this.mousedown = true;
    this.lastX = event.touches[0].clientX;
    this.lastWidth = this.width;
  }
  onTouchMove(event: TouchEvent) {
    const delta = event.touches[0].clientX - this.lastX;
    const width = this.lastWidth + delta;
    this.changed.next(width);
  }
  onToucheUp(event: TouchEvent) {
    this.mousedown = false;
  }

  onMouseLeave(event: MouseEvent) {
    this.onMouseUp(event);
  }

  onMouseEnter(event: MouseEvent) {}
}
