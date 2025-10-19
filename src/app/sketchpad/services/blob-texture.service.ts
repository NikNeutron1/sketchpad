import { Injectable } from '@angular/core';
import { IBoundsSize } from '../model/types';

@Injectable({ providedIn: 'root' })
export class BlobTextureService {
  canvasToImageBitmap(canvas: HTMLCanvasElement): Promise<ImageBitmap> {
    return createImageBitmap(canvas);
  }

  async blobToImage(
    blob: Blob,
    { width, height }: IBoundsSize,
  ): Promise<ImageBitmap> {
    return await createImageBitmap(blob);
  }

  async blobToCanvas(
    blob: Blob,
    { width, height }: IBoundsSize,
  ): Promise<HTMLCanvasElement> {
    const img = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
    return canvas;
  }

  async resize(blob: Blob, size: IBoundsSize): Promise<Blob> {
    const url = URL.createObjectURL(blob);
    const image = document.createElement('img');

    const loaded = new Promise<void>(
      (resolve) => (image.onload = () => resolve()),
    );
    image.src = url;
    await loaded;

    const canvas = document.createElement('canvas');

    const originalWidth = image.naturalWidth;
    const originalHeight = image.naturalHeight;
    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (originalWidth > size.width) {
      newWidth = size.width;
      newHeight = (originalHeight * newWidth) / originalWidth;
    }
    if (newHeight > size.height) {
      newHeight = size.height;
      newWidth = (originalWidth * newHeight) / originalHeight;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, newWidth, newHeight);
    const result = await new Promise<Blob>((r) =>
      canvas.toBlob((blob) => r(blob), blob.type),
    );
    URL.revokeObjectURL(url);
    return result;
  }
}
