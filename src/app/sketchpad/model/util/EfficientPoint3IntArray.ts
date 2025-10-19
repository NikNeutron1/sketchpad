import { IPoint3D } from '../types';
import { Algebra } from './algebra';
import { ColorUtils } from './color-utils';

export class EfficientPoint3IntArray {
  private array: Uint32Array;

  private point = Algebra.createPoint3D();

  private currentIndex = 0;

  constructor(size: number = 256) {
    this.array = new Uint32Array(size * 3);
    // alert('create efficient' + size * 3);
  }

  static fromPoints(points: IPoint3D[], size = 256): EfficientPoint3IntArray {
    return new EfficientPoint3IntArray(size).setPoints(points);
  }

  setPoints(points: IPoint3D[]): EfficientPoint3IntArray {
    points.forEach((p, i) => {
      this.array[3 * i + 0] = p.x;
      this.array[3 * i + 1] = p.y;
      this.array[3 * i + 2] = p.z;
    });
    this.currentIndex = points.length;
    return this;
  }

  get(index: number, target = Algebra.createPoint3D()): IPoint3D {
    target.x = this.array[index * 3 + 0];
    target.y = this.array[index * 3 + 1];
    target.z = this.array[index * 3 + 2];
    return target;
  }

  getColorIndex(distance: number): number {
    const r = this.array[distance * 3 + 0];
    const g = this.array[distance * 3 + 1];
    const b = this.array[distance * 3 + 2];
    return ColorUtils.rgbToIndex(r, g, b);
  }

  map(
    start: number,
    length: number,
    transform: (p: IPoint3D) => IPoint3D,
  ): EfficientPoint3IntArray {
    for (let i = start; i < start + length; i++) {
      this.point.x = this.array[i * 3 + 0];
      this.point.y = this.array[i * 3 + 1];
      this.point.z = this.array[i * 3 + 2];
      this.point = transform(this.point);
      this.array[i * 3 + 0] = this.point.x;
      this.array[i * 3 + 1] = this.point.y;
      this.array[i * 3 + 2] = this.point.z;
    }
    return this;
  }

  forEach(foo: (p: IPoint3D, index: number) => void): EfficientPoint3IntArray {
    const size = this.array.length / 3;
    for (let i = 0; i < size; i++) {
      this.point.x = this.array[i * 3 + 0];
      this.point.y = this.array[i * 3 + 1];
      this.point.z = this.array[i * 3 + 2];
      foo(this.point, i);
    }
    return this;
  }

  repeat(times: number): number {
    const segmentSize = this.currentIndex;
    for (let segment = 1; segment < times; segment++) {
      this.array.copyWithin(segment * segmentSize * 3, 0, segmentSize * 3);
    }
    this.currentIndex = segmentSize * times;
    return segmentSize;
  }

  export(): IPoint3D[] {
    const size = this.array.length / 3;
    const points = new Array(size);
    for (let i = 0; i < size; i++) {
      const x = this.array[i * 3 + 0];
      const y = this.array[i * 3 + 1];
      const z = this.array[i * 3 + 2];
      points[i] = Algebra.createPoint3D(x, y, z);
    }
    return points;
  }
}
