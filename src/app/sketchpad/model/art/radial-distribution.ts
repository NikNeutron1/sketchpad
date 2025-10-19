import { IPoint2D } from '../types';
import { Algebra } from '../util/algebra';
import { ArrayUtils } from '../util/ArrayUtils';
import { Point2D } from '../util/point-2d';

export class RadialDistribution {
  static fromRadius(radius: number, factor = 7): IPoint2D[] {
    return ArrayUtils.range(Math.round(radius / factor)).flatMap((i) => {
      const radius = i * factor;
      const count = 3 * i;
      const offset = !(i % 2) ? 0 : 60;
      return this.createRing(radius, count, offset);
    });
  }

  private static createRing(
    radius: number,
    count: number,
    offset: number,
  ): IPoint2D[] {
    const result = [];
    for (let i = 0; i < count; i++) {
      const degree = (i * 360) / count + offset;
      const p = Algebra.createPoint2D(radius, 0);
      Point2D.rotate(p, degree, p);
      result.push(p);
    }
    return result;
  }
}
