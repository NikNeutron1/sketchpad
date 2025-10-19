import { IBounds, IPoint2D } from '../types';
import { Algebra } from './algebra';
import { Bounds } from './bounds';

export class EfficientPoint2IntArray {
  private array: Uint32Array;

  private point = Algebra.createPoint2D();

  private currentIndex = 0;

  constructor(size: number = 256) {
    this.array = new Uint32Array(size * 2);
    // alert('create efficient' + size * 2);
  }

  static fromPoints(points: IPoint2D[], size = 256): EfficientPoint2IntArray {
    return new EfficientPoint2IntArray(size).setPoints(points);
  }

  getBounds(start: number, length: number): IBounds {
    const bounds = Bounds.creatNotInitialized();
    this.forEach(start, length, (point) => Bounds.extend(bounds, point));
    return bounds;
  }

  setPoints(points: IPoint2D[]): EfficientPoint2IntArray {
    points.forEach((p, i) => {
      this.array[2 * i + 0] = p.x;
      this.array[2 * i + 1] = p.y;
    });
    this.currentIndex = points.length;
    return this;
  }

  getLength() {
    return this.array.length / 2;
  }

  get(index: number, target = Algebra.createPoint2D()): IPoint2D {
    target.x = this.array[index * 2 + 0];
    target.y = this.array[index * 2 + 1];
    return target;
  }

  map(
    start: number,
    length: number,
    transform: (p: IPoint2D) => IPoint2D,
  ): EfficientPoint2IntArray {
    for (let i = start; i < start + length; i++) {
      this.point.x = this.array[i * 2 + 0];
      this.point.y = this.array[i * 2 + 1];
      this.point = transform(this.point);
      this.array[i * 2 + 0] = this.point.x;
      this.array[i * 2 + 1] = this.point.y;
    }
    return this;
  }

  setXY(index: number, x: number, y: number): void {
    this.array[index * 2 + 0] = x;
    this.array[index * 2 + 1] = y;
  }

  forEach(
    start: number,
    length: number,
    foo: (p: IPoint2D, index: number) => void,
  ): EfficientPoint2IntArray {
    for (let index = start; index < start + length; index++) {
      this.point.x = this.array[index * 2 + 0];
      this.point.y = this.array[index * 2 + 1];
      foo(this.point, index);
    }
    return this;
  }

  repeat(times: number): number {
    const segmentSize = this.currentIndex;
    for (let segment = 1; segment < times; segment++) {
      this.array.copyWithin(segment * segmentSize * 2, 0, segmentSize * 2);
    }
    this.currentIndex = segmentSize * times;
    return segmentSize;
  }

  export(): IPoint2D[] {
    const size = this.array.length / 2;
    const points = new Array(size);
    for (let i = 0; i < size; i++) {
      const x = this.array[i * 2 + 0];
      const y = this.array[i * 2 + 1];
      points[i] = Algebra.createPoint2D(x, y);
    }
    return points;
  }
}
