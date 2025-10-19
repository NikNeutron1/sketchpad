import { Injectable } from '@angular/core';
import { Algebra } from '../util/algebra';
import { EfficientPoint2IntArray } from '../util/EfficientPoint2IntArray';
import { Point2D } from '../util/point-2d';
import { Geo } from '../util/geo';

@Injectable({ providedIn: 'root' })
export class HilbertCurve2DService {
  curve2d(
    order: number,
    points?: EfficientPoint2IntArray,
    start?: number,
    length?: number,
  ): EfficientPoint2IntArray {
    const size = Math.pow(4, order);
    if (!points) {
      points = new EfficientPoint2IntArray(size);
      start = 0;
      length = size;
    }
    if (order === 1) {
      points.setXY(start + 0, 0, 0);
      points.setXY(start + 1, 0, 1);
      points.setXY(start + 2, 1, 1);
      points.setXY(start + 3, 1, 0);
      return points;
    } else {
      const lineLength = Math.pow(2, order - 1);

      const segmentLength = length / 4;
      this.curve2d(order - 1, points, start, segmentLength);
      this.flip_B(points, start, segmentLength);
      points.map(start, segmentLength, (p) => Point2D.addXY(p, 0, 0));

      const start2 = start + segmentLength;
      this.curve2d(order - 1, points, start2, segmentLength);
      points.map(start2, segmentLength, (p) => Point2D.addXY(p, 0, lineLength));

      const start3 = start2 + segmentLength;
      this.curve2d(order - 1, points, start3, segmentLength);
      points.map(start3, segmentLength, (p) =>
        Point2D.addXY(p, lineLength, lineLength),
      );

      const start4 = start3 + segmentLength;
      this.curve2d(order - 1, points, start4, segmentLength);
      this.flip_A(points, start4, segmentLength);
      points.map(start4, segmentLength, (p) => Point2D.addXY(p, lineLength, 0));

      return points;
    }
  }

  private flip_A(
    points: EfficientPoint2IntArray,
    start: number,
    length: number,
  ): EfficientPoint2IntArray {
    const bounds = points.getBounds(start, length);
    const a = Algebra.createPoint2D(0, bounds.height);
    const b = Algebra.createPoint2D(1, -1);
    const c = Algebra.createPoint2D(1, 1);
    points.map(start, length, (point) => {
      // const uv = Geo.uv_coord(point, a, b, c);
      const uv = Geo.solve_p_eq_a_add_X_x_b_add_Y_x_c(point, a, b, c);
      return Geo.a_add_b_x_alpha_add_c_x_beta(a, uv.x, b, -uv.y, c);
    });
    return points;
  }

  private flip_B(
    points: EfficientPoint2IntArray,
    start: number,
    length: number,
  ): EfficientPoint2IntArray {
    const a = Algebra.createPoint2D(0, 0);
    const b = Algebra.createPoint2D(1, 1);
    const c = Algebra.createPoint2D(1, -1);
    points.map(start, length, (point) => {
      const uv = Geo.uv_coord(point, a, b, c);
      return Geo.a_add_b_x_alpha_add_c_x_beta(a, uv.x, b, -uv.y, c);
    });
    return points;
  }
}
