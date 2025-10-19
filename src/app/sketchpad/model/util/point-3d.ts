import { IPoint3D, IPoint2D } from '../types';
import { Algebra } from './algebra';

export class Point3D {
  x = 'incompatible to IPoint3D'; // makes sure that you can not cast IPoint3D to Point3D
  static copy(p: IPoint3D): IPoint3D {
    return Algebra.createPoint3D(p.x, p.y, p.z);
  }
  static fromPoint2D(source: IPoint2D, z = 0): IPoint3D {
    return Algebra.createPoint3D(source.x, source.y, z);
  }
  static setZ(z: number, target: IPoint3D): IPoint3D {
    target.z = z;
    return target;
  }
  static setXYZ(x = 0, y = 0, z = 0, target: IPoint3D): IPoint3D {
    target.x = x;
    target.y = y;
    target.z = z;
    return target;
  }
  static set<T extends IPoint3D>(p: T, x = p.x, y = p.y, z = p.z): T {
    p.x = x;
    p.y = y;
    p.z = z;
    return p;
  }
  static isPoint(value: any): value is IPoint2D {
    if (!value || typeof value === 'number') {
      return false;
    }
    return (
      'x' in value &&
      'y' in value &&
      'z' in value &&
      Object.keys(value).length <= 4
    );
  }

  static setPoint<T extends IPoint3D>(target: T, value: IPoint3D): T {
    return this.set(target, value.x, value.y, value.z ?? 0);
  }
  static setPoint2(target: IPoint3D, value: IPoint2D, z: number = 0): void {
    this.set(target, value.x, value.y, z);
  }
  static normalize(
    vec: IPoint3D,
    length = 1,
    target = Algebra.createPoint3D(),
  ): IPoint3D {
    const size = Point3D.size(vec);
    this.mul(vec, length / size, target);
    return target;
  }
  static interpolate(
    p1: IPoint3D,
    p2: IPoint3D,
    fraction: number,
    target = Algebra.createPoint3D(),
  ): IPoint3D {
    const delta = this.sub(p2, p1, target);
    const vector = this.mul(delta, fraction, delta);
    const result = this.add(p1, vector, vector);
    if (isNaN(result.x)) {
      console.log(result);
      console.trace();
    }
    return result;
  }
  static add(
    p1: IPoint3D,
    p2: IPoint3D,
    target = Algebra.createPoint3D(),
  ): IPoint3D {
    target.x = p1.x + p2.x;
    target.y = p1.y + p2.y;
    target.z = p1.z + p2.z;
    return target;
  }
  static addXYZ(
    p: IPoint3D,
    x: number,
    y: number,
    z: number = 0,
    target = Algebra.createPoint3D(),
  ): IPoint3D {
    target.x = p.x + x;
    target.y = p.y + y;
    target.z = p.z + z;
    return target;
  }
  static sub(
    p1: IPoint3D,
    p2: IPoint3D,
    target = Algebra.createPoint3D(),
  ): IPoint3D {
    target.x = p1.x - p2.x;
    target.y = p1.y - p2.y;
    target.z = p1.z - p2.z;
    return target;
  }
  static mul(
    p: IPoint3D,
    m: number,
    target = Algebra.createPoint3D(),
  ): IPoint3D {
    target.x = p.x * m;
    target.y = p.y * m;
    target.z = p.z * m;
    return target;
  }
  public static dst(p1: IPoint3D, p2: IPoint3D): number {
    var x = p1.x - p2.x;
    var y = p1.y - p2.y;
    var z = p1.z - p2.z;
    return Math.sqrt(x * x + y * y + z * z);
  }
  static size(p: IPoint3D): number {
    return Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
  }
  static vectorProduct(
    vec1: IPoint3D,
    vec2: IPoint3D,
    result = Algebra.createPoint3D(),
  ): IPoint3D {
    result.x = vec1.y * vec2.z - vec1.z * vec2.y;
    result.y = vec1.z * vec2.x - vec1.x * vec2.z;
    result.z = vec1.x * vec2.y - vec1.y * vec2.x;
    return result;
  }
  public static equals(p1: IPoint3D, p2: IPoint3D): boolean {
    return p1.x === p2.x && p1.y === p2.y && p1.z === p2.z;
  }
  static toString(p: IPoint3D, digits?: number): string {
    let x: number, y: number, z: number;
    if (digits) {
      var po = Math.pow(10, digits);
      x = Math.floor(p.x * po) / po;
      y = Math.floor(p.y * po) / po;
      z = Math.floor(p.z * po) / po;
    } else {
      x = p.x;
      y = p.y;
      z = p.z;
    }

    return `(${x}, ${y}, ${z})`;
  }
  public static floor(
    p: IPoint3D,
    digits = 0,
    result = Algebra.createPoint3D(),
  ): IPoint3D {
    const ten = Math.pow(10, digits);
    result.x = Math.floor(p.x * ten) / ten;
    result.y = Math.floor(p.y * ten) / ten;
    result.z = Math.floor(p.z * ten) / ten;
    return result;
  }
  public static round(
    p: IPoint3D,
    digits = 0,
    result = Algebra.createPoint3D(),
  ): IPoint3D {
    const ten = Math.pow(10, digits);
    result.x = Math.round(p.x * ten) / ten;
    result.y = Math.round(p.y * ten) / ten;
    result.z = Math.round(p.z * ten) / ten;
    return result;
  }
  static avg(points: IPoint3D[], target = Algebra.createPoint3D()): IPoint3D {
    target.x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    target.y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    target.z = points.reduce((sum, p) => sum + p.z, 0) / points.length;
    return target;
  }

  static avg2(
    a: IPoint3D,
    b: IPoint3D,
    target = Algebra.createPoint3D(),
  ): IPoint3D {
    target.x = (a.x + b.x) / 2;
    target.y = (a.y + b.y) / 2;
    target.z = (a.z + b.z) / 2;
    return target;
  }

  public static compact({ x, y, z }: IPoint3D): ICompactPoint3D {
    if (Number.isNaN(x)) {
      console.warn('compact point NaN');
      console.trace();
    }
    return `${x},${y},${z}`;
  }

  public static validCompact(compact: string): boolean {
    if (!compact) {
      return false;
    }
    const p = compact.split(/[;,]/);
    return p.every((text) => text !== 'NaN');
  }

  public static fromCompact(compact: string): IPoint3D {
    const p = compact.split(/[;,]/);
    return Algebra.createPoint3D(+p[0], +p[1], +p[2]);
  }

  // this one might be wrong rotated
  static rotateXY(
    p: IPoint3D,
    deg: number,
    target = Algebra.createPoint3D(),
  ): IPoint3D {
    const alpha = (deg * 2 * Math.PI) / 360;
    const px = p.x;
    const py = p.y;
    target.x = Math.cos(alpha) * px - Math.sin(alpha) * py;
    target.y = Math.sin(alpha) * px + Math.cos(alpha) * py;
    target.z = p.z;
    return target;
  }

  static rotateXZ(
    p: IPoint3D,
    deg: number,
    target = Algebra.createPoint3D(),
  ): IPoint3D {
    const alpha = (deg * 2 * Math.PI) / 360;
    const px = p.x;
    const pz = p.z;
    target.x = Math.cos(alpha) * px - Math.sin(alpha) * pz;
    target.y = p.y;
    target.z = Math.sin(alpha) * px + Math.cos(alpha) * pz;
    return target;
  }

  static rotateYZ(
    p: IPoint3D,
    deg: number,
    target = Algebra.createPoint3D(),
  ): IPoint3D {
    const alpha = (deg * 2 * Math.PI) / 360;
    const py = p.y;
    const pz = p.z;
    target.x = p.x;
    target.y = Math.cos(alpha) * py - Math.sin(alpha) * pz;
    target.z = Math.sin(alpha) * py + Math.cos(alpha) * pz;
    return target;
  }
}

export type ICompactPoint3D = `${number},${number},${number}`;
