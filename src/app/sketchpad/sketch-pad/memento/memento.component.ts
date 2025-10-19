import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Memento } from '../../util/memento';

@Component({
  selector: 'app-memento',
  templateUrl: './memento.component.html',
  styleUrls: ['./memento.component.scss'],
})
export class MementoComponent implements OnChanges {
  animate: 'undo' | 'redo' = null;

  private time = 0;

  @Input()
  memento: Memento<any>;

  ngOnChanges(changes: SimpleChanges): void {
    this.memento.onChanged().subscribe((value) => {
      this.animate = value;
      this.time = Date.now() + 449;
      setTimeout(() => Date.now() > this.time && (this.animate = null), 450);
    });
  }

  hasUndo(): boolean {
    return this.memento.hasUndo();
  }

  hasRedo(): boolean {
    return this.memento.hasRedo();
  }

  undo(): void {
    this.memento.undo();
  }

  redo(): void {
    this.memento.redo();
  }

  isSaved(): boolean {
    return true;
  }
  countUndo(): number {
    return this.memento.countUndo();
  }

  countRedo(): number {
    return 1;
  }
}
