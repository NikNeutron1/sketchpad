import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BlobTextureService } from '../services/blob-texture.service';
import { ShortcutService } from '../services/shortcut.service';
import { TempSubscriber } from '../util/temp-subscriber';
import { Point2D } from '../model/util/point-2d';
import { ColorUtils } from '../model/util/color-utils';
import { Algebra } from '../model/util/algebra';
import { Memento } from '../util/memento';
import { IPoint2D } from '../model/types';

export type ISketchAction = {
  colorIndex: number;
  lineWidth: number;
  mouse: IPoint2D;
  lastMouse: IPoint2D;
}[];

@Component({
  selector: 'app-sketch-pad',
  templateUrl: './sketch-pad.component.html',
  styleUrls: ['./sketch-pad.component.scss'],
})
export class SketchPadComponent implements OnInit, AfterViewInit, OnDestroy {
  colorIndex = 0;

  lineWidth = 5;

  // lineWidth = 100;

  mapping = [
    ['x', 'r'],
    ['y', 'g'],
    ['z', 'b'],
  ] as const;

  isDrawing = false;

  @ViewChild('sketchPad', { static: true })
  canvasRef: ElementRef<HTMLCanvasElement>;

  @ViewChild('vertSlider', { static: true })
  vertSlider: ElementRef<HTMLDivElement>;

  lastMouse: IPoint2D;

  image = {
    name: 'mysketch.png',
    width: 400,
    height: 400,
    source: ImageBitmap.prototype,
  };

  memento = new Memento<ISketchAction>((change, type) => {
    // console.log(type, change);
    if (type === 'redo') {
      change.forEach((item) => this.drawPoint(item));
    } else {
      this.resetSource();
      const history = this.memento.getChangesUntil(change);
      // console.log(history, this.image.source);
      history.forEach((change) =>
        change.forEach((item) => this.drawPoint(item)),
      );
    }
  });

  subs: TempSubscriber;

  constructor(
    private readonly blobTextureService: BlobTextureService,
    private readonly shortCutService: ShortcutService,
  ) {}

  ngOnInit(): void {
    this.subs = TempSubscriber.from(
      this.shortCutService.onCtrlZ().subscribe(() => this.memento.undo()),
      this.shortCutService.onCtrlY().subscribe(() => this.memento.redo()),
    );

    window.onpopstate = (event) => {
      if (event.state) {
        console.log(event.state);
        if (event.state.itemId > this.memento.countUndo()) {
          this.memento.redo();
        } else {
          this.memento.undo();
        }
      }
    };
  }

  ngOnDestroy(): void {
    this.subs.destroy();
  }

  ngAfterViewInit(): void {
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    const size = canvas.getBoundingClientRect();
    this.blobTextureService.canvasToImageBitmap(canvas).then((bitmap) => {
      this.image.source = bitmap;
    });
  }

  getVertRange(): { height: string; x: string; y: string } {
    const element = this.vertSlider.nativeElement;
    if (!element) {
      return { height: '100px', x: '-50px', y: '-20px' };
    }
    const bounds = element.getBoundingClientRect();
    const height = bounds.height - 20;
    return {
      height: `${height}px`,
      y: `${-height / 2}px`,
      x: `${-bounds.width / 2}px`,
    };
  }

  resetSource(): void {
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    const size = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.image.source, 0, 0);
  }

  get hexColor(): string {
    if (!this.colorIndex) return 'black';
    return ColorUtils.colorIndexToHex(this.colorIndex);
  }

  drawStart(event: MouseEvent) {
    this.isDrawing = true;
    this.lastMouse = this.mouseEventToMouse(event);
    this.memento.add([]);
    const itemId = this.memento.countUndo();
    history.pushState({ page: 'sketchpad', itemId }, '', window.location.href);
  }
  drawStop(event: MouseEvent) {
    this.isDrawing = false;
    this.lastMouse = null;
  }
  drawMove(event: MouseEvent) {
    if (!this.isDrawing || !this.canvasRef.nativeElement) return;
    const mouse = this.mouseEventToMouse(event);
    const lastMouse = Point2D.copy(this.lastMouse);
    const change: ISketchAction[0] = {
      mouse,
      lastMouse,
      colorIndex: this.colorIndex,
      lineWidth: this.lineWidth,
    };
    this.drawPoint(change);
    this.memento.getCurrent().push(change);
    this.lastMouse = mouse;
  }

  private mouseEventToMouse(event: MouseEvent): IPoint2D {
    const offset = Algebra.createPoint2D(event.offsetX, event.offsetY);
    return this.styleTransformPoint(offset);
  }

  private touchEventToMouse(event: TouchEvent): IPoint2D {
    const touch = event.touches[0];
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    const offset = Algebra.createPoint2D(offsetX, offsetY);
    return this.styleTransformPoint(offset);
  }

  private styleTransformPoint(mouse: IPoint2D) {
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    const size = canvas.getBoundingClientRect();
    const width = canvas.width;
    const height = canvas.height;
    mouse.x = (mouse.x * width) / size.width;
    mouse.y = (mouse.y * height) / size.height;
    mouse.x = Math.round(mouse.x);
    mouse.y = Math.round(mouse.y);
    return mouse;
  }

  onTouchDown(event: TouchEvent) {
    this.isDrawing = true;
    const mouse = this.touchEventToMouse(event);
    this.lastMouse = mouse;
    this.memento.add([]);
    const itemId = this.memento.countUndo();
    history.pushState({ page: 'sketchpad', itemId }, '', window.location.href);
  }

  onToucheUp(event: TouchEvent) {
    this.isDrawing = false;
  }
  onTouchMove(event: TouchEvent) {
    if (!this.isDrawing || !this.canvasRef.nativeElement) return;

    const mouse = this.touchEventToMouse(event);
    const lastMouse = this.lastMouse;
    const change: ISketchAction[0] = {
      mouse,
      lastMouse,
      colorIndex: this.colorIndex,
      lineWidth: this.lineWidth,
    };
    this.drawPoint(change);
    this.memento.getCurrent().push(change);

    this.lastMouse = mouse;
    event.preventDefault();
  }

  drawPoint({ colorIndex, lastMouse, lineWidth, mouse }: ISketchAction[0]) {
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (colorIndex === undefined) colorIndex = 0;
    const color = ColorUtils.colorIndexToHex(colorIndex);

    if (lastMouse) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastMouse.x, lastMouse.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    } else {
      ctx.lineWidth = 1;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, lineWidth, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  update1(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.colorIndex = ColorUtils.hexToInt(input);
  }

  setColor(key: 'x' | 'y' | 'z', event: Event) {
    const input = (event.target as HTMLInputElement).value;
    const value = Math.floor(+input);
    const color = ColorUtils.colorIndexToRGB(this.colorIndex);
    color[key] = value;
    this.colorIndex = ColorUtils.rgbPointToIndex(color);
  }

  setLineWidth(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.lineWidth = +input;
  }

  setColorIndex(colorIndex: number) {
    this.colorIndex = colorIndex;
  }

  getChannel(key: 'x' | 'y' | 'z'): number {
    return ColorUtils.colorIndexToRGB(this.colorIndex)[key];
  }
}
