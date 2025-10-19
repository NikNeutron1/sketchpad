import { Injectable } from '@angular/core';
import { IMatrix4D } from '../types';

@Injectable({ providedIn: 'root' })
export class DomMatrixService {
  create(): DOMMatrix {
    return new DOMMatrix();
  }

  translate(x = 0, y = 0, z = 0): DOMMatrix {
    return this.create().translateSelf(x, y, z);
  }

  scale(x = 1, y = 1, z = 1): DOMMatrix {
    return this.create().scaleSelf(x, y, z);
  }

  rotateX(deg: number): DOMMatrix {
    // const theta = (deg * Math.PI) / 180;
    // return this.create().rotateSelf(theta, 0, 0);
    return this.create().rotateSelf(deg, 0, 0);
  }

  rotateY(deg: number): DOMMatrix {
    // const theta = (deg * Math.PI) / 180;
    // return this.create().rotateSelf(0, theta, 0);
    return this.create().rotateSelf(0, deg, 0);
  }

  rotateZ(deg: number): DOMMatrix {
    // const theta = (deg * Math.PI) / 180;
    // return this.create().rotateSelf(0, 0, theta);
    return this.create().rotateSelf(0, 0, deg);
  }

  multiplySequence(array: DOMMatrix[]): DOMMatrix {
    return array.reduce(
      (result, matrix) => this.multiplyMatrices(result, matrix),
      this.create(),
    );
  }

  multiplyMatrices(a: DOMMatrix, b: DOMMatrix): DOMMatrix {
    return DOMMatrix.fromMatrix(a).multiplySelf(b);
  }

  domMatrixToMatrix4(domMatrix: DOMMatrix): IMatrix4D {
    const elements: IMatrix4D['elements'] = [
      // Row 1
      domMatrix.m11,
      domMatrix.m12,
      domMatrix.m13,
      domMatrix.m14,
      // Row 2
      domMatrix.m21,
      domMatrix.m22,
      domMatrix.m23,
      domMatrix.m24,
      // Row 3
      domMatrix.m31,
      domMatrix.m32,
      domMatrix.m33,
      domMatrix.m34,
      // Row 4
      domMatrix.m41,
      domMatrix.m42,
      domMatrix.m43,
      domMatrix.m44,
    ];
    return { elements: elements };
  }
}
