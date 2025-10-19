import { IBounds, IPoint2D } from '../types';
import { Algebra } from './algebra';
import { Point2D } from './point-2d';

export class Bounds {
  static size(bounds: IBounds): number {
    return bounds.width * bounds.height;
  }

  static set(target: IBounds, x = 0, y = 0, width = 0, height = 0): IBounds {
    target.x = x;
    target.y = y;
    target.width = width;
    target.height = height;
    return target;
  }

  static setBounds(target: IBounds, bounds: IBounds): IBounds {
    return this.set(target, bounds.x, bounds.y, bounds.width, bounds.height);
  }

  static isEmpty(box: IBounds): boolean {
    return box.width <= 0 || box.height <= 0;
  }

  static isNotInitialized(box: IBounds): boolean {
    return box.width < 0 || box.height < 0;
  }

  static creatNotInitialized(): IBounds {
    return Algebra.createBounds(0, 0, -1, -1);
  }

  static getCorners(bounds: IBounds): IPoint2D[] {
    return [
      Algebra.createPoint2D(bounds.x, bounds.y),
      Algebra.createPoint2D(bounds.x + bounds.width, bounds.y),
      Algebra.createPoint2D(bounds.x, bounds.y + bounds.height),
      Algebra.createPoint2D(bounds.x + bounds.width, bounds.y + bounds.height),
    ];
  }

  static transformToRenderTargetSpace(
    bounds: IBounds,
    width: number,
    height: number,
    screenWidth: number,
    screenHeight: number,
  ) {
    const selection = { ...bounds };
    selection.x = (selection.x * width) / screenWidth;
    selection.y = (selection.y * height) / screenHeight;
    selection.width *= width / screenWidth;
    selection.height *= height / screenHeight;

    selection.x = Math.round(selection.x);
    selection.y = Math.round(selection.y);
    selection.width = Math.round(selection.width);
    selection.height = Math.round(selection.height);

    selection.y = height - selection.y - selection.height;
    selection.y -= 3;

    return selection;
  }

  static fromCenter(center: IPoint2D, radius: number): IBounds {
    return Algebra.createBounds(
      center.x - radius,
      center.y - radius,
      2 * radius,
      2 * radius,
    );
  }

  static fromPoints(...points: IPoint2D[]): IBounds {
    return this.fromPoints2(points);
  }

  static fromPoints2(points: IPoint2D[]): IBounds {
    if (!points.length) {
      return Bounds.creatNotInitialized();
    }
    const x1 = points.reduce((min, p) => (p.x < min ? p.x : min), points[0].x);
    const y1 = points.reduce((min, p) => (p.y < min ? p.y : min), points[0].y);
    const x2 = points.reduce((max, p) => (p.x > max ? p.x : max), points[0].x);
    const y2 = points.reduce((max, p) => (p.y > max ? p.y : max), points[0].y);
    return Algebra.createBounds(x1, y1, x2 - x1, y2 - y1);
  }

  static fromVertices(array: Float32Array): IBounds {
    if (!array.length || array.length % 2 === 1) {
      return Bounds.creatNotInitialized();
    }
    const minX = array.reduce(
      (min, v, i) => (i % 2 == 0 && v < min ? v : min),
      array[0],
    );
    const minY = array.reduce(
      (min, v, i) => (i % 2 == 1 && v < min ? v : min),
      array[1],
    );
    const maxX = array.reduce(
      (max, v, i) => (i % 2 == 0 && v > max ? v : max),
      array[0],
    );
    const maxY = array.reduce(
      (max, v, i) => (i % 2 == 1 && v > max ? v : max),
      array[1],
    );
    return Algebra.createBounds(minX, minY, maxX - minX, maxY - minY);
  }

  static center(bounds: IBounds, result = Algebra.createPoint2D()): IPoint2D {
    result.x = bounds.x + bounds.width / 2;
    result.y = bounds.y + bounds.height / 2;
    return result;
  }

  static contains(bounds: IBounds, point: IPoint2D): boolean {
    const x = bounds.x <= point.x && point.x <= bounds.x + bounds.width;
    const y = bounds.y <= point.y && point.y <= bounds.y + bounds.height;
    return x && y;
  }

  static extend(bounds: IBounds, p: IPoint2D): IBounds {
    if (this.isNotInitialized(bounds)) {
      bounds.x = p.x;
      bounds.y = p.y;
      bounds.width = 0;
      bounds.height = 0;
    }
    if (p.x < bounds.x) {
      bounds.width = bounds.width + bounds.x - p.x;
      bounds.x = p.x;
    }
    if (p.y < bounds.y) {
      bounds.height = bounds.height + bounds.y - p.y;
      bounds.y = p.y;
    }
    if (p.x > bounds.x + bounds.width) {
      bounds.width = p.x - bounds.x;
    }
    if (p.y > bounds.y + bounds.height) {
      bounds.height = p.y - bounds.y;
    }
    return bounds;
  }

  static merge(bounds1: IBounds, bounds2: IBounds, target = bounds1): IBounds {
    if (this.isNotInitialized(bounds1)) {
      return this.setBounds(target, bounds2);
    } else if (this.isNotInitialized(bounds2)) {
      return this.setBounds(target, bounds1);
    }
    const x1 = Math.min(bounds1.x, bounds2.x);
    const y1 = Math.min(bounds1.y, bounds2.y);
    const x2 = Math.max(bounds1.x + bounds1.width, bounds2.x + bounds2.width);
    const y2 = Math.max(bounds1.y + bounds1.height, bounds2.y + bounds2.height);
    target.x = x1;
    target.y = y1;
    target.width = x2 - x1;
    target.height = y2 - y1;
    return target;
  }

  static mergeAll(
    boundsList: IBounds[],
    target = this.creatNotInitialized(),
  ): IBounds {
    return boundsList.reduce(
      (sum, bounds) => this.merge(bounds, sum, sum),
      target,
    );
  }

  static intersects(bounds1: IBounds, bounds2: IBounds): boolean {
    const a = bounds1.x + bounds1.width < bounds2.x;
    const b = bounds1.x > bounds2.x + bounds2.width;
    const c = bounds1.y + bounds1.height < bounds2.y;
    const d = bounds1.y > bounds2.y + bounds2.height;
    const noIntersection = a || b || c || d;
    return !noIntersection;
  }

  static intersect(bounds1: IBounds, bounds2: IBounds): IBounds {
    if (!this.intersects(bounds1, bounds2)) {
      return this.creatNotInitialized();
    }
    const x1 = Math.max(bounds1.x, bounds2.x);
    const y1 = Math.max(bounds1.y, bounds2.y);
    const x2 = Math.min(bounds1.x + bounds1.width, bounds2.x + bounds2.width);
    const y2 = Math.min(bounds1.y + bounds1.height, bounds2.y + bounds1.height);
    return Algebra.createBounds(x1, y1, x2 - x1, y2 - y1);
  }

  static toString(bounds: IBounds): string {
    return `bounds(${bounds.x}, ${bounds.x}, ${bounds.width}, ${bounds.height})`;
  }

  static convert(bounds: IBounds): {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
  } {
    return {
      x1: bounds.x,
      y1: bounds.y,
      x2: bounds.x + bounds.width,
      y2: bounds.y + bounds.height,
    };
  }

  static minMax(value: number, min: number, max: number) {
    return Math.max(Math.min(value, max), min);
  }

  static p2(bounds: IBounds, target = Algebra.createPoint2D()): IPoint2D {
    return Point2D.set(
      target,
      bounds.x + bounds.width,
      bounds.y + bounds.height,
    );
  }
}
