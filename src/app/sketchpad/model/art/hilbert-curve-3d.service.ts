import { Injectable } from '@angular/core';
import { MatrixService } from '../service/matrix.service';
import { MatrixWorkerService } from '../service/matrix-worker.service';
import { IMatrix4D } from '../types';
import { EfficientPoint3IntArray } from '../util/EfficientPoint3IntArray';

@Injectable({ providedIn: 'root' })
export class HilbertCurve3DService {
  private matrixCollections: IMatrix4D[][] = [];
  constructor(
    private readonly matrixService: MatrixService,
    private readonly matrixWorkerService: MatrixWorkerService,
  ) {
    this.init();
  }

  private init() {
    for (var i = 0; i < 10; i++) {
      this.matrixCollections.push(this.getCollection(i));
    }
  }

  curve3d(order: number): EfficientPoint3IntArray {
    const buffer = new EfficientPoint3IntArray(Math.pow(2, order * 3));
    this.curve3d_2(order, buffer);
    return buffer;
  }

  private getBasePoints() {
    return [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 1, y: 1, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 1, y: 0, z: 1 },
      { x: 1, y: 1, z: 1 },
      { x: 0, y: 1, z: 1 },
      { x: 0, y: 0, z: 1 },
    ];
  }

  private curve3d_2(order: number, buffer: EfficientPoint3IntArray): void {
    if (order === 1) {
      buffer.setPoints(this.getBasePoints());
    } else {
      this.curve3d_2(order - 1, buffer);
      const segmentSize = buffer.repeat(8);
      const collection = this.matrixCollections[order];
      for (var i = 0; i < 8; i++) {
        buffer.map(i * segmentSize, segmentSize, (p) =>
          this.matrixWorkerService.applyMatrix4(p, collection[i]),
        );
      }
    }
  }

  private getCollection(order: number): IMatrix4D[] {
    const length = Math.pow(2, order - 1);
    const unit = length - 1;

    const matrix1 = this.matrixService.multiplySequence([
      this.matrixService.rotateZ(90),
      this.matrixService.rotateY(90),
      this.matrixService.scale(1, -1, 1),
      this.matrixService.rotateZ(90),
      this.matrixService.translate(0, 0, 0),
    ]);

    const matrix2 = this.matrixService.multiplySequence([
      this.matrixService.rotateY(-90),
      this.matrixService.scale(-1, 1, 1),
      this.matrixService.rotateY(180),
      this.matrixService.translate(0, length, 0),
    ]);

    const matrix3 = this.matrixService.translate(length, length, 0);

    const matrix4 = this.matrixService.multiplySequence([
      this.matrixService.rotateZ(-90),
      this.matrixService.rotateX(-90),
      this.matrixService.translate(-unit, -unit, length),
    ]);

    const matrix5 = this.matrixService.multiplySequence([
      this.matrixService.translate(-0.5, -0.5, -0.5),
      this.matrixService.rotateY(90),
      this.matrixService.rotateZ(90),
      this.matrixService.scale(-1, 1, -1),
      this.matrixService.translate(0.5, 0.5, 0.5),
      this.matrixService.translate(-length, length, -2 * length),
    ]);

    const matrix6 = this.matrixService.translate(length, length, length);

    const matrix7 = this.matrixService.multiplySequence([
      this.matrixService.translate(-0.5, -0.5, -0.5),
      this.matrixService.rotateY(-90),
      this.matrixService.scale(-1, 1, 1),
      this.matrixService.translate(0.5, 0.5, 0.5),
      this.matrixService.translate(-2 * length, length, -length),
    ]);

    const matrix8 = this.matrixService.multiplySequence([
      this.matrixService.translate(-0.5, -0.5, -0.5),
      this.matrixService.rotateZ(-90),
      this.matrixService.rotateY(90),
      this.matrixService.scale(-1, -1, -1),
      this.matrixService.rotateZ(-90),
      this.matrixService.rotateX(180),
      this.matrixService.translate(0.5, 0.5, 0.5),
      this.matrixService.translate(0, -2 * length, -length),
    ]);

    [
      matrix1,
      matrix2,
      matrix3,
      matrix4,
      matrix5,
      matrix6,
      matrix7,
      matrix8,
    ].forEach((matrix) => {
      for (let i = 0; i < matrix.elements.length; i++) {
        const ten = Math.pow(10, 0);
        matrix.elements[i] = Math.round(matrix.elements[i] * ten) / ten;
      }
    });

    return [
      matrix1,
      matrix2,
      matrix3,
      matrix4,
      matrix5,
      matrix6,
      matrix7,
      matrix8,
    ];
  }
}
