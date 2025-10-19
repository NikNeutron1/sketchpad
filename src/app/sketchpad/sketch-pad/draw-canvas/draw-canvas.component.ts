import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { IPoint2D } from '../../model/types';
import { Algebra } from '../../model/util/algebra';
import { ColorUtils } from '../../model/util/color-utils';
import { Point2D } from '../../model/util/point-2d';
import { BlobTextureService } from '../../services/blob-texture.service';
import { ShortcutService } from '../../services/shortcut.service';
import { Memento } from '../../util/memento';
import { ReadyResource } from '../../util/ready-resource';
import { TempSubscriber } from '../../util/temp-subscriber';

export type ISketchAction = {
  colorIndex: number;
  lineWidth: number;
  mouse: IPoint2D;
  lastMouse: IPoint2D;
}[];

@Component({
  selector: 'app-draw-canvas',
  templateUrl: './draw-canvas.component.html',
  styleUrls: ['./draw-canvas.component.scss'],
})
export class DrawCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  colorIndex = 0;

  @Input()
  lineWidth = 5;

  @Input()
  source: ImageBitmap = null;

  @Output()
  onDrawLine = new EventEmitter<IPoint2D>();

  isDrawing = false;

  lastMouse: IPoint2D;

  @ViewChild('drawCanvas', { static: true })
  canvasRef: ElementRef<HTMLCanvasElement>;

  // restoreTexture: ITexture;

  ready = new ReadyResource<true>();

  memento = new Memento<ISketchAction>((change, type) =>
    this.handleChange(change, type),
  );

  private subs: TempSubscriber;
  private backupPopState: (this: WindowEventHandlers, ev: PopStateEvent) => any;

  constructor(
    private readonly shortCutService: ShortcutService,
    private readonly blobTextureService: BlobTextureService,
  ) {}

  ngOnInit(): void {
    this.subs = TempSubscriber.from(
      this.shortCutService.onCtrlZ().subscribe(() => this.memento.undo()),
      this.shortCutService.onCtrlY().subscribe(() => this.memento.redo()),
    );
    this.backupPopState = window.onpopstate;
    window.onpopstate = (event) =>
      event.state && event.state.itemId > this.memento.countUndo()
        ? this.memento.redo()
        : this.memento.undo();
  }

  ngAfterViewInit(): void {
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    const size = canvas.getBoundingClientRect();
    if (!this.source) {
      this.blobTextureService
        .canvasToImageBitmap(canvas)
        .then((bitmap) => (this.source = bitmap));
    }
    this.ready.resolve(true);
  }

  get width(): number {
    // return this.source?.width ?? 512;
    return 512;
  }

  get height(): number {
    // return this.source?.height ?? 512;
    return 512;
  }

  ngOnDestroy(): void {
    this.subs.destroy();
    window.onpopstate = this.backupPopState;
  }

  handleChange(change: ISketchAction, type: 'undo' | 'redo'): void {
    if (type === 'redo') {
      change.forEach((item) => this.drawPoint(item));
    } else {
      this.resetSource();
      const history = this.memento.getChangesUntil(change);
      history.forEach((change) =>
        change.forEach((item) => this.drawPoint(item)),
      );
    }
  }

  resetSource(): void {
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    const size = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // const texture1 = this.restoreTexture;
    // const img = texture1.source.data;
    // ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  onPointerDown(event: PointerEvent): void {
    this.isDrawing = true;
    this.lastMouse = this.pointerEventToMouse(event);
    this.memento.add([]);
    const itemId = this.memento.countUndo();
    history.pushState({ page: 'sketchpad', itemId }, '', window.location.href);
    this.onPointerMove(event);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDrawing || !this.canvasRef.nativeElement) return;
    const mouse = this.pointerEventToMouse(event);
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
    this.onDrawLine.emit(mouse);
  }

  onPointerUp(event: PointerEvent): void {
    this.isDrawing = false;
    this.lastMouse = null;
  }

  drawPoint({ colorIndex, lastMouse, lineWidth, mouse }: ISketchAction[0]) {
    if (colorIndex === undefined) colorIndex = 0;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    const color = ColorUtils.colorIndexToHex(colorIndex);

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastMouse.x, lastMouse.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
  }

  private pointerEventToMouse(event: PointerEvent): IPoint2D {
    const offset = Algebra.createPoint2D(event.offsetX, event.offsetY);
    return this.styleTransformPoint(offset);
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

  private styleTransformPoint(mouse: IPoint2D): IPoint2D {
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
}
