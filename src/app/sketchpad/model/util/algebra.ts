import { IBounds, IPoint2D, IPoint3D } from '../types';

export class Algebra {
  static createPoint2D(x = 0, y = 0): IPoint2D {
    return { x, y };
  }

  static createPoint3D(x = 0, y = 0, z = 0): IPoint3D {
    return { x, y, z };
  }

  static createBounds(x = 0, y = 0, width = 0, height = 0): IBounds {
    return { x, y, width, height };
  }
}
