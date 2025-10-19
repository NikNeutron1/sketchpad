import { Injectable } from '@angular/core';
import { HilbertCurveMappingService } from './hilbert-curve-mapping.service';
import { ColorUtils } from '../util/color-utils';
import { ReadyResource } from '../../util/ready-resource';
import { BlobTextureService } from '../../services/blob-texture.service';

@Injectable({ providedIn: 'root' })
export class HilberColorPalette {
  palette1d = new ReadyResource<ImageBitmap>();
  palette2d = new ReadyResource<ImageBitmap>();

  constructor(
    private readonly blobTextureService: BlobTextureService,
    private readonly hilbertCurveMappingService: HilbertCurveMappingService,
  ) {
    this.init();
  }

  getPalette1d(): ReadyResource<ImageBitmap> {
    return this.palette1d;
  }

  getPalette2d(): ReadyResource<ImageBitmap> {
    return this.palette2d;
  }

  private async init() {
    this.prepImage2d();
    this.prepImage1d();
  }

  private async prepImage1d() {
    const size1d = this.hilbertCurveMappingService.getSize1d();
    const size3d = this.hilbertCurveMappingService.getSize3d();

    const outSize1d = Math.min(1024, size1d);
    const ratio = outSize1d / size1d;
    const canvas1d = new OffscreenCanvas(size1d * ratio, 1);
    const ctx = canvas1d.getContext('2d');
    for (let i = 0; i < size1d; i++) {
      const x = i * ratio;
      const width = Math.max(size1d * ratio, 1);

      const color = this.hilbertCurveMappingService.distanceToRGB(i, size1d);
      color.x = Math.floor((color.x * 256) / size3d.width);
      color.y = Math.floor((color.y * 256) / size3d.height);
      color.z = Math.floor((color.z * 256) / size3d.depth);
      const hexColor = ColorUtils.rgbPointToHex(color);

      ctx.fillStyle = hexColor;
      ctx.fillRect(x, 0, width, 1);
    }
    const blob1d = await canvas1d.convertToBlob({
      quality: 1,
      type: 'image/png',
    });
    const image1d = await this.blobTextureService.blobToImage(blob1d, {
      width: size1d * ratio,
      height: 1,
    });
    this.palette1d.resolve(image1d);
  }

  private async prepImage2d() {
    const size2d = this.hilbertCurveMappingService.getSize2d();

    const canvas2d = new OffscreenCanvas(size2d.width, size2d.height);
    const ctx = canvas2d.getContext('2d');
    ctx.strokeStyle = 'black';
    ctx.imageSmoothingEnabled = false;
    const size1d = this.hilbertCurveMappingService.getSize1d();
    const max1 = Math.max(canvas2d.width, canvas2d.height);
    const max2 = this.hilbertCurveMappingService.getSize2d().width;
    const radius = (0.7 * max1) / max2;

    for (let i = 0; i < size1d; i++) {
      const point = this.hilbertCurveMappingService.distanceToXY(i, size1d);
      const size2d = this.hilbertCurveMappingService.getSize2d();
      ((point.x = (point.x * canvas2d.width) / size2d.width),
        (point.y = (point.y * canvas2d.height) / size2d.height));

      const color = this.hilbertCurveMappingService.distanceToRGB(i, size1d);
      const size3d = this.hilbertCurveMappingService.getSize3d();
      color.x = Math.floor((color.x * 256) / size3d.width);
      color.y = Math.floor((color.y * 256) / size3d.height);
      color.z = Math.floor((color.z * 256) / size3d.depth);

      const hexColor = ColorUtils.rgbPointToHex(color);

      ctx.fillStyle = hexColor;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    const blob2d = await canvas2d.convertToBlob({
      quality: 1,
      type: 'image/png',
    });
    const image2d = await this.blobTextureService.blobToImage(blob2d, size2d);
    this.palette2d.resolve(image2d);
  }
}
