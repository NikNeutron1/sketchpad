import { Injectable } from '@angular/core';
import { Camera, Matrix4 } from 'three';

@Injectable({ providedIn: 'root' })
export class MatrixService {
  create(): Matrix4 {
    return new Matrix4();
  }

  translate(x = 0, y = 0, z = 0): Matrix4 {
    return this.create().makeTranslation(x, y, z);
  }

  scale(x = 1, y = 1, z = 1): Matrix4 {
    return this.create().makeScale(x, y, z);
  }

  rotateX(deg: number): Matrix4 {
    const theta = (deg * 2 * Math.PI) / 360;
    return this.create().makeRotationX(theta);
  }

  rotateY(deg: number): Matrix4 {
    const theta = (deg * 2 * Math.PI) / 360;
    return this.create().makeRotationY(theta);
  }

  rotateZ(deg: number): Matrix4 {
    const theta = (deg * 2 * Math.PI) / 360;
    return this.create().makeRotationZ(theta);
  }

  multiplySequence(array: Matrix4[]): Matrix4 {
    return array.reduce(
      (result, matrix) => this.multiplyMatrices(result, matrix),
      this.create(),
    );
  }

  multiplyMatrices(a: Matrix4, b: Matrix4): Matrix4 {
    return this.create().multiplyMatrices(a, b);
  }

  screenTransformToWorldTransform(
    screenTransform: Matrix4,
    camera: Camera,
    screenWidth: number,
    screenHeight: number,
  ): void {
    const clipToSceenSpace = this.scale(
      screenWidth * 0.5,
      -screenHeight * 0.5,
    ).multiply(this.translate(1.0, -1.0));
    const screenToClipSpace = this.translate(-1.0, 1.0).multiply(
      this.scale(2.0 / screenWidth, -2.0 / screenHeight),
    );

    const userMatrix = screenToClipSpace
      .multiply(screenTransform)
      .multiply(clipToSceenSpace);

    const projection = camera.projectionMatrix.clone();
    const view = camera.matrixWorldInverse.clone();
    const mvp = projection.multiply(view);
    const mvpInverse = mvp.clone().invert();

    const worldTransform = mvpInverse.multiply(userMatrix).multiply(mvp);

    return worldTransform;
  }

  domMatrixToMatrix4(domMatrix: DOMMatrix): Matrix4 {
    return new Matrix4().set(
      domMatrix.m11,
      domMatrix.m21,
      domMatrix.m31,
      domMatrix.m41,
      domMatrix.m12,
      domMatrix.m22,
      domMatrix.m32,
      domMatrix.m42,
      domMatrix.m13,
      domMatrix.m23,
      domMatrix.m33,
      domMatrix.m43,
      domMatrix.m14,
      domMatrix.m24,
      domMatrix.m34,
      domMatrix.m44,
    );
  }
}
