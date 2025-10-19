import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { DrawCanvasComponent } from '../draw-canvas/draw-canvas.component';
import { Algebra } from '../../model/util/algebra';
import { ColorUtils } from '../../model/util/color-utils';
import { TempSubscriber } from '../../util/temp-subscriber';
import { InputHandler } from './input-handler';
import { IUniform } from '../../model/types';

@Component({
  selector: 'app-compact-sketch-pad',
  templateUrl: './compact-sketch-pad.component.html',
  styleUrls: ['./compact-sketch-pad.component.scss'],
})
export class CompactSketchPadComponent
  extends InputHandler
  implements AfterViewInit, OnDestroy, OnChanges
{
  // @Input()
  // uniform: IUniform<Texture>;

  // texture: CanvasTexture;

  colorIndex = 0;

  lineWidth = 5;

  image = {
    name: 'mysketch.png',
    width: 400,
    height: 400,
    source: ImageBitmap.prototype,
  };

  @ViewChild('sketchPad', { static: true })
  drawCanvas: DrawCanvasComponent;

  mouse = Algebra.createPoint2D();

  subs: TempSubscriber;

  colorMode: '1d' | '2d' = '1d';

  ngAfterViewInit(): void {
    this.subs = TempSubscriber.from(
      this.drawCanvas.onDrawLine.subscribe(() => {
        // this.texture.needsUpdate = true;
      }),
    );
    const canvas = this.drawCanvas.canvasRef.nativeElement;
    // this.texture = new CanvasTexture(canvas);
    // this.uniform.value = this.texture;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('uniform' in changes) {
      // this.drawCanvas.restoreTexture = this.uniform.value;
      // this.uniform.value = this.texture;
      this.drawCanvas.ready.ifPromised(() => {
        this.drawCanvas.resetSource();
      }) || this.drawCanvas.resetSource();
    }
  }

  ngOnDestroy(): void {
    this.subs.destroy();
  }

  setColorIndex(colorIndex: number) {
    this.colorIndex = colorIndex;
  }

  update1(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.colorIndex = ColorUtils.hexToInt(input);
  }

  get hexColor(): string {
    if (!this.colorIndex) return 'black';
    return ColorUtils.colorIndexToHex(this.colorIndex);
  }
}
