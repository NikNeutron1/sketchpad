import { IHexColor, IPoint3D } from '../types';
import { Algebra } from './algebra';

export class ColorUtils {
  private static toHex(num: number): string {
    if (num === 0) {
      return '00';
    }
    let res = num.toString(16);
    if (res.length < 2) {
      res = '0' + res;
    }
    return res;
  }

  static colorIndexToHex(colorIndex: number): IHexColor {
    return ('#' + ('000000' + colorIndex.toString(16)).slice(-6)) as IHexColor;
  }

  public static rgbToHexArr(color: number[]): string {
    return this.rgbToHex(color[0], color[1], color[2]);
  }
  public static rgbToHex(r: number, g: number, b: number): string {
    return '#' + this.toHex(r) + this.toHex(g) + this.toHex(b);
  }
  public static rgbPointToHex(p: IPoint3D): IHexColor {
    return ('#' +
      this.toHex(p.x) +
      this.toHex(p.y) +
      this.toHex(p.z)) as IHexColor;
  }
  public static hexToInt(hex: string): number {
    return Number.parseInt(hex.replace('#', ''), 16);
  }
  public static hexToIntPoint3D(hex: string): IPoint3D {
    const value = this.hexToInt(hex);
    const floor = Math.floor;
    // this is inconsistent... shit
    return Algebra.createPoint3D(
      floor(value) % 256,
      floor(value / 256) % 256,
      floor(value / 65536) % 256,
    );
    /* 
        return Algebra.createPoint3D(
            floor(value / 65536) % 256,
            floor(value / 256) % 256,
            floor(value) % 256,
        );
*/
  }

  public static hexToFloat(
    hex: string,
    result = Algebra.createPoint3D(),
  ): IPoint3D {
    result.x = parseInt(hex.substring(1, 3), 16) / 255.0;
    result.y = parseInt(hex.substring(3, 5), 16) / 255.0;
    result.z = parseInt(hex.substring(5, 7), 16) / 255.0;
    return result;
  }

  public static floatToHex(color: IPoint3D): string {
    const colorIndex =
      color.x * 255 * 255 * 255 + color.y * 255 * 255 + color.z * 255;
    return this.colorIndexToHex(colorIndex);
  }

  private static tmpResult = Algebra.createPoint3D();
  public static hexToRGB(
    hex: string,
    result: IPoint3D = this.tmpResult,
  ): IPoint3D {
    result.x = parseInt(hex.substring(1, 3), 16);
    result.y = parseInt(hex.substring(3, 5), 16);
    result.z = parseInt(hex.substring(5, 7), 16);
    return result;
  }
  private static colorToFloatResult = Algebra.createPoint3D();
  public static colorToFloat(
    color: IPoint3D,
    result: IPoint3D = this.colorToFloatResult,
  ): IPoint3D {
    result.x = color.x / 255.0;
    result.y = color.y / 255.0;
    result.z = color.z / 255.0;
    return result;
  }

  public static randomCreme() {
    let num = 0xaaaaaa | (0xffffff * Math.random());
    num = 0x666666 | (0xffffff * Math.random());
    num = 0xffffff - num;
    // num = 0x666666 | 0xffffff * Math.random();
    const color = num.toString(16);
    const r = parseInt(color.substring(0, 2), 16) / 256.0;
    const g = parseInt(color.substring(2, 4), 16) / 256.0;
    const b = parseInt(color.substring(4, 6), 16) / 256.0;
    return `#${color}`;
  }

  public static randomBlue(): string {
    return this.randomBrightness([false, false, true]);
    // return this.randomColor();
  }
  public static randomColor(): string {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return this.rgbToHex(r, g, b);
  }
  public static randomGreen(): string {
    return this.randomBrightness([false, true, false]);
  }
  public static randomTeal(): string {
    return this.randomBrightness([false, true, true]);
  }
  public static randomRed(): string {
    return this.randomBrightness([true, false, false]);
  }
  public static randomPink(): string {
    return this.randomBrightness([true, false, true]);
  }
  public static randomYellow(): string {
    return this.randomBrightness([true, true, false]);
  }
  private static lastRandom = 0;
  private static random(): number {
    const offset = 0.4;
    // return (2 - 2 * offset) * Math.random() + offset;
    const off = 0.15;
    this.lastRandom = (this.lastRandom + off) % 1.2;
    return this.lastRandom + offset;
  }
  private static randomBrightness(usedColors: boolean[]): string {
    const random = this.random();
    const v =
      random >= 1 ? Math.floor(255 * (random - 1)) : Math.floor(255 * random);
    const color: number[] = new Array(3);
    for (let i = 0; i < 3; i++) {
      if (usedColors[i]) {
        color[i] = random >= 1 ? 255 : v;
      } else {
        color[i] = random >= 1 ? v : 0;
      }
    }
    return this.rgbToHexArr(color);
  }
  public static brightness(usedColors: boolean[], value: number): string {
    const v =
      value >= 1 ? Math.floor(255 * (value - 1)) : Math.floor(255 * value);
    const color: number[] = new Array(3);
    for (let i = 0; i < 3; i++) {
      if (usedColors[i]) {
        color[i] = value >= 1 ? 255 : v;
      } else {
        color[i] = value >= 1 ? v : 0;
      }
    }
    return this.rgbToHexArr(color);
  }

  static colorIndexToFloat(
    value: number,
    result = Algebra.createPoint3D(),
  ): IPoint3D {
    return this.colorToFloat(this.colorIndexToRGB(value, result), result);
  }

  public static colorIndexToRGB(
    value: number,
    result = Algebra.createPoint3D(),
  ): IPoint3D {
    // const div = 256;
    // result.x = Math.floor(value / (div * div)) % div;
    // result.y = Math.floor(value / div) % div;
    // result.z = value % div;
    result.x = (value >> 16) & 255;
    result.y = (value >> 8) & 255;
    result.z = value & 255;
    // const r = (colorIndex >> 16) & 255;
    // const g = (colorIndex >> 8) & 255;
    // const b = colorIndex & 255;
    return result;
  }

  public static sizeRGB(): { width: 256; height: 256; depth: 256 } {
    return { width: 256, height: 256, depth: 256 };
  }

  public static sizeRGBNum(): 16_777_216 {
    return 16_777_216;
  }

  public static rgbPointToIndex(rgb: IPoint3D): number {
    return this.rgbToIndex(rgb.x, rgb.y, rgb.z);
  }

  public static rgbToIndex(r: number, g: number, b: number): number {
    return r * 65536 + g * 256 + b;
  }

  // public static xyPointToIndex(point: IPoint2D): number {
  //   return this.xyToIndex(point.x, point.y);
  // }
  // public static xyToIndex(x: number, y: number): number {
  //   return x * 4096 + y;
  // }
}
