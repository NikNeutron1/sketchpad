import { Injectable } from '@angular/core';
import { IPoint3D, IMatrix4D } from '../types';

@Injectable({ providedIn: 'root' })
export class MatrixWorkerService {
  /**
   * stolen from threejs
   **/
  applyMatrix4(point: IPoint3D, matrix: IMatrix4D): IPoint3D {
    const x = point.x;
    const y = point.y;
    const z = point.z;

    const e = matrix.elements;

    const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

    point.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
    point.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
    point.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

    return point;
  }
}
