import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { HilberColorPalette } from '../../model/art/hilbert-color-palette.service';
import { HilbertCurveMappingService } from '../../model/art/hilbert-curve-mapping.service';
import { IPoint2D, IBoundsSize } from '../../model/types';
import { Algebra } from '../../model/util/algebra';
import { ColorUtils } from '../../model/util/color-utils';
import { BlobTextureService } from '../../services/blob-texture.service';
import { TempSubscriber } from '../../util/temp-subscriber';

@Component({
  selector: 'app-color-palette',
  templateUrl: './color-palette.component.html',
  styleUrls: ['./color-palette.component.scss'],
})
export class ColorPaletteComponent implements OnChanges, OnInit, AfterViewInit {
  @Input()
  colorIndex: number;

  @Input()
  radius = 20;

  colorIndex_: number;

  @Output()
  colorChanged = new EventEmitter<number>();

  subs: TempSubscriber;

  @ViewChild('colorPalette', { static: true })
  private canvasRef: ElementRef<HTMLCanvasElement>;

  mouse = Algebra.createPoint2D();
  mousePressed = false;

  width: number;
  height: number;

  constructor(
    private readonly blobTextureService: BlobTextureService,
    private readonly hilberColorPalette: HilberColorPalette,
    private readonly hilbertCurveMappingService: HilbertCurveMappingService,
  ) {
    const size2d = this.hilbertCurveMappingService.getSize2d();
    this.width = Math.max(size2d.width, 512);
    this.height = Math.max(size2d.height, 512);
    this.width = size2d.width;
    this.height = size2d.height;
    // const upscale = 4;
    // this.width = size2d.width * upscale;
    // this.height = size2d.height * upscale;
  }
  ngAfterViewInit(): void {
    this.ngOnInit();
  }
  ngOnInit(): void {
    this.hilberColorPalette
      .getPalette2d()
      .ifPromised(() => this.repaintCanvas()) || this.repaintCanvas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.canvasRef.nativeElement) {
      return;
    }
    if ('colorIndex' in changes) {
      if (
        this.colorIndex_ === this.colorIndex ||
        this.colorIndex === undefined
      ) {
      } else {
        this.mouse = this.colorToMouse(this.colorIndex);
        this.colorIndex_ = this.colorIndex;
        this.repaintCanvas(true);
      }
    }
    if ('radius' in changes) {
      this.mouse = this.colorToMouse(this.colorIndex);
      this.colorIndex_ = this.colorIndex;
      this.repaintCanvas();
    }
  }

  onPointerUp(event: PointerEvent) {
    event.preventDefault();
    this.mousePressed = false;
    if (this.colorIndex !== this.colorIndex_) {
      this.colorChanged.emit(this.colorIndex_);
    }
  }

  onPointerDown(event: PointerEvent) {
    event.preventDefault();
    this.mousePressed = true;
    this.onPointerMove(event);
  }

  onPointerMove(event: PointerEvent) {
    event.preventDefault();
    const mouse = Algebra.createPoint2D(event.offsetX, event.offsetY);
    this.mouse = this.styleTransformPoint(mouse);
    if (this.mousePressed) {
      this.repaintCanvas(true);
    }
  }

  private styleTransformPoint(mouse: IPoint2D) {
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    const size = canvas.getBoundingClientRect();
    const width = canvas.width;
    const height = canvas.height;
    mouse.x = (mouse.x * width) / size.width;
    mouse.y = (mouse.y * height) / size.height;
    return mouse;
  }

  getSize(): IBoundsSize & { size: number } {
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    const width = canvas.width;
    const height = canvas.height;
    return { width, height, size: width * height };
  }

  repaintCanvas(xxyz = false) {
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    const size = canvas.getBoundingClientRect();

    const radius = (this.width * this.radius) / size.width / 2;
    const lineWidth = (this.width * 2.0) / size.width;
    const radius2 = radius;

    const ctx = canvas.getContext('2d');
    const paletteImage = this.hilberColorPalette.getPalette2d().getPresent();
    if (paletteImage) {
      ctx.drawImage(paletteImage, 0, 0, this.width, this.height);
    }

    const colorIndex = this.mouseToColorIndex(this.mouse);
    const color = ColorUtils.colorIndexToHex(colorIndex);
    if (xxyz && colorIndex !== this.colorIndex_) {
      this.colorIndex_ = colorIndex;
      this.colorChanged.emit(this.colorIndex_);
    }

    ctx.imageSmoothingQuality = 'low';
    ctx.strokeStyle = 'black';
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = color;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = lineWidth;
    if (this.width > 8) {
      ctx.beginPath();
      ctx.arc(this.mouse.x, this.mouse.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.mouse.x, this.mouse.y, radius2, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  colorToMouse(colorIndex: number): IPoint2D {
    const rgb = ColorUtils.colorIndexToRGB(colorIndex);
    const sizeRGB = ColorUtils.sizeRGB();
    const walk3dDistance = this.hilbertCurveMappingService.rgbPointToDistance(
      rgb,
      sizeRGB,
    );

    const size1d = this.hilbertCurveMappingService.getSize1d();
    const point = this.hilbertCurveMappingService.distanceToXY(
      walk3dDistance,
      size1d,
    );

    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    const width = canvas.width;
    const height = canvas.height;

    const size2d = this.hilbertCurveMappingService.getSize2d();
    point.x = Math.floor(point.x * (width / size2d.width));
    point.y = Math.floor(point.y * (height / size2d.height));

    return point;
  }

  mouseToColorIndex(mouse: IPoint2D): number {
    const myBounds = this.getSize();
    const size1d = this.hilbertCurveMappingService.getSize1d();
    const size2d = this.hilbertCurveMappingService.getSize2d();
    const walk3dDistance = this.hilbertCurveMappingService.xyPointToDistance(
      mouse,
      myBounds,
    );
    const size3d = this.hilbertCurveMappingService.getSize3d();
    const color = this.hilbertCurveMappingService.distanceToRGB(
      walk3dDistance,
      size1d,
    );
    color.x = Math.floor((color.x * 256.0) / size3d.width);
    color.y = Math.floor((color.y * 256.0) / size3d.height);
    color.z = Math.floor((color.z * 256.0) / size3d.depth);
    return ColorUtils.rgbPointToIndex(color);
  }
}
