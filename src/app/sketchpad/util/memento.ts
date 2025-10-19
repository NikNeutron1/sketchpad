import { Observable, Subject } from 'rxjs';

export class Memento<T> {
  private changeIndex = -1;
  private changes: T[] = [];
  private changed = new Subject<'undo' | 'redo'>();

  constructor(
    private applyChange: (change: T, type: 'undo' | 'redo') => void,
  ) {}

  onChanged(): Observable<'undo' | 'redo'> {
    return this.changed;
  }

  hasUndo(): boolean {
    return this.changeIndex >= 0;
  }

  countUndo(): number {
    return this.changeIndex + 1;
  }

  undo(): void {
    if (!this.hasUndo()) {
      console.warn('No more changes to undo.');
      return;
    }
    const changes = this.changes[this.changeIndex];
    this.applyChange(changes, 'undo');
    this.changeIndex--;
    this.changed.next('undo');
  }

  getChangesUntil(change: T): T[] {
    const index = this.changes.indexOf(change);
    return this.changes.slice(0, index);
  }

  getCurrent(): T {
    return this.changes[this.changeIndex];
  }

  hasRedo(): boolean {
    return this.changeIndex + 1 < this.changes.length;
  }

  redo(): void {
    if (!this.hasRedo()) {
      return;
    }
    this.changeIndex++;
    const change = this.changes[this.changeIndex];
    this.applyChange(change, 'redo');
    this.changed.next('redo');
  }

  add(change: T, record = true): void {
    if (!record) return;
    if (this.changeIndex < this.changes.length - 1) {
      this.changes = this.changes.slice(0, this.changeIndex + 1);
    }
    this.changes.push(change);
    this.changeIndex = this.changes.length - 1;
    this.changed.next('redo');
  }
}
