import { Injectable } from '@angular/core';
import { HilbertCurve3DService } from './hilbert-curve-3d.service';
import { HilbertCurve2DService } from './hilbert-curve-2d.service';
import { IBounds3dSize, IBoundsSize, IPoint2D, IPoint3D } from '../types';
import { EfficientPoint2IntArray } from '../util/EfficientPoint2IntArray';
import { EfficientPoint3IntArray } from '../util/EfficientPoint3IntArray';
import { Algebra } from '../util/algebra';

const options = {
  max: {
    order3d: 8,
    order2d: 12,
    size: 16_777_216, //48 MB = 256 * 256 * 256, 4096 * 4096;
  },
  balanced: {
    order3d: 6,
    order2d: 9,
    size: 262_144, // 0.75 MB = 64 * 64 * 64; // 512 * 512;
  },
  efficient: {
    order3d: 4,
    order2d: 6,
    size: 4_096, // 0.012 MB = 64 * 64 = 16 * 16 * 16
  },
  toy: {
    order3d: 2,
    order2d: 3,
    size: 64, // 0.00018 MB = 4 * 4 * 4 = 8 * 8
  },
};

const selected = options.balanced;

@Injectable({ providedIn: 'root' })
export class HilbertCurveMappingService {
  private curve3d: EfficientPoint3IntArray;
  private rgbToHilbertDistance = new Uint32Array(selected.size);

  private curve2d: EfficientPoint2IntArray;
  private xyToHilbertDistance = new Uint32Array(selected.size);

  order3d = selected.order3d;
  order2d = selected.order2d;

  constructor(
    private readonly hilbertCurve3DService: HilbertCurve3DService,
    private readonly hilbertCurve2DService: HilbertCurve2DService,
  ) {
    this.init();
  }

  getSize1d(): number {
    const size = this.getSize2d();
    return size.width * size.height;
  }

  getSize3d(): IBounds3dSize {
    let width: number, height: number, depth: number;
    width = height = depth = Math.pow(2, this.order3d);
    return { width, height, depth };
  }

  getSize2d(): IBoundsSize {
    let width: number, height: number;
    width = height = Math.pow(2, this.order2d);
    return { width, height };
  }

  init() {
    const curve2d = this.hilbertCurve2DService.curve2d(this.order2d);
    curve2d.forEach(0, curve2d.getLength(), (point, index) => {
      const size2d = this.getSize2d();
      const index2d = point.y * size2d.width + point.x;
      this.xyToHilbertDistance[index2d] = index;
    });
    this.curve2d = curve2d;

    const curve3d = this.hilbertCurve3DService.curve3d(this.order3d);
    curve3d.forEach((p, index) => {
      const { width, height, depth } = this.getSize3d();
      const index3d = p.z * width * height + p.y * width + p.x;
      this.rgbToHilbertDistance[index3d] = index;
    });
    this.curve3d = curve3d;

    const test = this.hilbertCurve3DService.curve3d(2);
  }

  colorIndexToDistance(colorIndex: number): number {
    const size1d = this.getSize1d();
    const max = 256 * 256 * 256;
    const index = Math.floor(colorIndex * (size1d / max));
    return this.rgbToHilbertDistance[index];
  }

  distanceToColorIndex(distance: number, max: number): number {
    const size1d = this.getSize1d();
    const index = Math.floor(distance * (size1d / max));
    return this.curve3d.getColorIndex(index);
  }

  distanceToRGB(
    distance: number,
    max: number,
    target = Algebra.createPoint3D(),
  ): IPoint3D {
    const size1d = this.getSize1d();
    const index = Math.floor(distance * (size1d / max));
    return this.curve3d.get(index, target);
  }

  xyPointToDistance(point: IPoint2D, size: IBoundsSize): number {
    const size2d = this.getSize2d();
    const x = Math.floor((point.x * size2d.width) / size.width);
    const y = Math.floor((point.y * size2d.height) / size.height);
    const index = y * size2d.width + x;
    const result = this.xyToHilbertDistance[index];
    return result;
  }

  distanceToXY(distance: number, max: number): IPoint2D {
    const size1d = this.getSize1d();
    const index = Math.floor(distance * (size1d / max));
    const source = this.curve2d.get(index);
    return Algebra.createPoint2D(source.x, source.y);
  }

  colorIndexToCurvePoint2d(colorIndex: number): IPoint2D {
    const size1d = this.getSize1d();
    const max = 256 * 256 * 256;
    const index = Math.floor(colorIndex * (size1d / max));
    const point = this.curve2d.get(index);
    return point;
  }

  rgbPointToDistance(rgb: IPoint3D, sizeIn: IBounds3dSize): number {
    const { width, height, depth } = this.getSize3d();

    const x = Math.floor(rgb.x * (width / sizeIn.width));
    const y = Math.floor(rgb.y * (height / sizeIn.height));
    const z = Math.floor(rgb.z * (depth / sizeIn.depth));

    const index = z * width * height + y * width + x;

    const distance = this.rgbToHilbertDistance[index];

    return distance;
  }
}
