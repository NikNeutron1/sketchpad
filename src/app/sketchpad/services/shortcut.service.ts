import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShortcutService {
  ctrlZ = new Subject<void>();
  ctrlY = new Subject<void>();

  ctrl = new BehaviorSubject<boolean>(false);

  ctrlS = new Subject<void>();

  constructor() {
    this.init();
  }

  private init(): void {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  private onKeyDown(evt: KeyboardEvent): void {
    if (evt.ctrlKey) {
      if (evt.key.toLocaleLowerCase() === 'z') {
        this.ctrlZ.next(null);
      } else if (evt.key.toLocaleLowerCase() === 'y') {
        this.ctrlY.next(null);
      } else if (evt.key.toLocaleLowerCase() === 's') {
        this.ctrlS.next(null);
        evt.preventDefault();
      } else if (
        evt.key.toLocaleLowerCase() === 'control' &&
        !this.ctrl.getValue()
      ) {
        this.ctrl.next(true);
      }
    }
  }

  private onKeyUp(evt: KeyboardEvent): void {
    if (evt.key.toLocaleLowerCase() === 'control') {
      this.ctrl.next(false);
    }
  }

  onCtrl(): Observable<boolean> {
    return this.ctrl.asObservable();
  }

  onCtrlZ(): Observable<void> {
    return this.ctrlZ.asObservable();
  }

  onCtrlY(): Observable<void> {
    return this.ctrlY.asObservable();
  }

  onCtrlS(): Observable<void> {
    return this.ctrlS.asObservable();
  }
}
