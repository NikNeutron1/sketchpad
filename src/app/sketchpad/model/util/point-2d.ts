import { IPoint2D } from '../types';
import { Algebra } from './algebra';

export class Point2D {
  x = 'incompatible to IPoint2D'; // makes sure that you can not caste IPoint2D to Point2D

  static copy(p: IPoint2D): IPoint2D {
    return Algebra.createPoint2D(p.x, p.y);
  }

  static add(
    p1: IPoint2D,
    p2: IPoint2D,
    target = Algebra.createPoint2D(),
  ): IPoint2D {
    target.x = p1.x + p2.x;
    target.y = p1.y + p2.y;
    return target;
  }

  static addAll(
    points: IPoint2D[],
    target = Algebra.createPoint2D(),
  ): IPoint2D {
    return points.reduce((sum, p) => this.add(sum, p, sum), target);
  }

  static addXY(
    p1: IPoint2D,
    x: number,
    y: number,
    target = Algebra.createPoint2D(),
  ): IPoint2D {
    target.x = p1.x + x;
    target.y = p1.y + y;
    return target;
  }

  static sub(
    p1: IPoint2D,
    p2: IPoint2D,
    target = Algebra.createPoint2D(),
  ): IPoint2D {
    target.x = p1.x - p2.x;
    target.y = p1.y - p2.y;
    return target;
  }
  static mul(
    p: IPoint2D,
    m: number,
    target = Algebra.createPoint2D(),
  ): IPoint2D {
    target.x = p.x * m;
    target.y = p.y * m;
    return target;
  }

  static setPoint(target: IPoint2D, value: IPoint2D): IPoint2D {
    return this.set(target, value.x, value.y);
  }

  private static angleBuf = Algebra.createPoint2D();

  static getAngle(vec: IPoint2D): number {
    const dir2d = this.normalize(vec, 1, this.angleBuf);
    const angle = Math.atan2(dir2d.y, dir2d.x);
    // if (angle < 0.0) {
    //   return angle + 2.0 * Math.PI;
    // }
    // return angle;
    return angle;
  }

  static getAngleBetweenVectors(vec1: IPoint2D, vec2: IPoint2D): number {
    const angle1 = this.getAngle(vec1);
    const angle2 = this.getAngle(vec2);
    return angle1 - angle2;
  }

  static set(target: IPoint2D, x = 0, y = 0): IPoint2D {
    target.x = x;
    target.y = y;
    return target;
  }

  static normalize(
    vec: IPoint2D,
    length = 1.0,
    target = Algebra.createPoint2D(),
  ): IPoint2D {
    const size = Point2D.size(vec);
    return this.mul(vec, length / size, target);
  }

  static rotate(
    p: IPoint2D,
    deg: number,
    target = Algebra.createPoint2D(),
  ): IPoint2D {
    const alpha = (deg * 2 * Math.PI) / 360;
    const px = p.x;
    const py = p.y;
    target.x = Math.cos(alpha) * px - Math.sin(alpha) * py;
    target.y = Math.sin(alpha) * px + Math.cos(alpha) * py;
    return target;
  }

  static rotate90(p: IPoint2D, target = Algebra.createPoint2D()): IPoint2D {
    const px = p.x;
    const py = p.y;
    target.x = 0 - py;
    target.y = px;
    return target;
  }
  static dst(p1: IPoint2D, p2: IPoint2D): number {
    const x = p1.x - p2.x;
    const y = p1.y - p2.y;
    return Math.sqrt(x * x + y * y);
  }
  static avg(points: IPoint2D[], target = Algebra.createPoint2D()): IPoint2D {
    target.x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    target.y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    return target;
  }

  static vectorLength(vec: IPoint2D): number {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
  }

  static size(p: IPoint2D): number {
    return Math.sqrt(p.x * p.x + p.y * p.y);
  }

  static pointsToVertices(points: IPoint2D[]): Float32Array {
    return points.reduce(
      (arr, point, i) => {
        arr[i * 2 + 0] = point.x;
        arr[i * 2 + 1] = point.y;
        return arr;
      },
      new Float32Array(points.length * 2),
    );
  }

  static verticesToPoints(vertices: Float32Array): IPoint2D[] {
    const points = new Array(vertices.length / 2);
    for (let i = 0; i < points.length; i++) {
      const x = vertices[i * 2 + 0];
      const y = vertices[i * 2 + 1];
      points[i] = Algebra.createPoint2D(x, y);
    }
    return points;
  }

  static reverseVertices(vertices: Float32Array): void {
    const m = vertices.length / 2;
    const n = vertices.length;
    for (let i = 0; i < m; i += 2) {
      const x1 = vertices[i];
      const y1 = vertices[i + 1];
      const x2 = vertices[n - 2 - i];
      const y2 = vertices[n - 1 - i];
      vertices[i] = x2;
      vertices[i + 1] = y2;
      vertices[n - 2 - i] = x1;
      vertices[n - 1 - i] = y1;
    }
  }

  static eqPoint(p1: IPoint2D, p2: IPoint2D, error = 0.00001): boolean {
    const x = Math.abs(p1.x - p2.x);
    const y = Math.abs(p1.y - p2.y);
    return x <= error && y <= error;
  }

  static oppositeVector(p1: IPoint2D, p2: IPoint2D, error = 0.00001): boolean {
    const x = Math.abs(p1.x + p2.x);
    const y = Math.abs(p1.y + p2.y);
    return x <= error && y <= error;
  }

  static equals(p1: IPoint2D, p2: IPoint2D): boolean {
    return p1.x === p2.x && p1.y === p2.y;
  }

  static toString(p: IPoint2D, digits?: number): string {
    let x: number, y: number;
    if (digits) {
      var po = Math.pow(10, digits);
      x = Math.floor(p.x * po) / po;
      y = Math.floor(p.y * po) / po;
    } else {
      x = p.x;
      y = p.y;
    }
    return `(${x}, ${y})`;
  }

  static isPoint(value: any): value is IPoint2D {
    if (typeof value === 'number') {
      return false;
    }
    return 'x' in value && 'y' in value && Object.keys(value).length <= 4;
  }

  public static floor(
    p: IPoint2D,
    digits = 0,
    result = Algebra.createPoint2D(),
  ): IPoint2D {
    const ten = Math.pow(10, digits);
    result.x = Math.floor(p.x * ten) / ten;
    result.y = Math.floor(p.y * ten) / ten;
    return result;
  }
}
