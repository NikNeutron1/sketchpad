export type NumberArray = number[] | Array<number> | Uint32Array | Float32Array;

export interface Equalable {
  equals(val: Equalable): boolean;
}
export class ArrayUtils {
  static range(count: number): Array<number> {
    const result = new Array(count);
    for (let i = 0; i < count; i++) result[i] = i;
    return result;
  }
  public static lastIndex<T>(array: T[], test: (a: T) => boolean): number {
    for (let i = array.length - 1; i >= 0; i--) {
      if (test(array[i])) {
        return i;
      }
    }
    return -1;
  }

  public static difference<T>(
    a: T[],
    b: T[],
    equals: (a: T, b: T) => boolean,
  ): T[] {
    return a.filter((v1) => !b.find((v2) => equals(v1, v2)));
  }

  public static intersects<T>(a: T[], b: T[]): boolean {
    return a.reduce((intersects, v) => intersects || b.includes(v), false);
  }

  public static distinct<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  public static distinctBy<T>(
    array: T[],
    equals: (a: T, b: T) => boolean,
  ): T[] {
    const result: T[] = [];
    array.forEach((item) => {
      const found = result.find((item2) => equals(item, item2));
      if (!found) {
        result.push(item);
      }
    });
    return result;
  }

  public static pushDistinct<T>(array: T[], ...items: T[]): void {
    return this.pushDistinctAll(array, items);
  }

  public static pushDistinctAll<T>(array: T[], items: T[]): void {
    items.forEach((item) => this.pushDistinct1(array, item));
  }

  public static pushDistinct1<T>(array: T[], item: T): number {
    return !array.includes(item) && array.push(item);
  }

  /**
   *   TODO
   *   has O(n*n), better would be
   * 		1. sort in O(nlogn),
   * 		2. isSubset in O(n)
   */
  public static isSubsets<T>(array: T[], subset: T[]): boolean {
    if (array === subset) {
      return true;
    }
    if (subset.length > array.length) {
      return false;
    }
    for (const value of subset) {
      if (!this.contains(array, value)) {
        return false;
      }
    }
    return true;
  }

  /**
   * @deprecated
   * @param array
   * @param value
   * @returns
   */
  public static contains<T>(array: readonly T[], value: T): boolean {
    // return array.indexOf(value) !== -1;
    return array.includes(value);
  }
  // static replaceFirst<T>(array: T[], before: T, next: T): void {
  //   array.splice(array.indexOf(before), 1, next);
  // }
  public static replaceAll<T>(array: T[], before: T, next: T): void {
    if (before === next) {
      return;
    }
    while (array.indexOf(before) !== -1) {
      array.splice(array.indexOf(before), 1, next);
    }
  }
  public static replaceAllIn<T>(target: T[], beforeValues: T[], next: T): void {
    beforeValues.forEach((before) => this.replaceAll(target, before, next));
  }

  /**
   * 	[1, 1, 1, 2, 2, 3, 3, 3, 4] -> [1, 2, 3, 4]
   */
  public static clearNeighbouringDuplicates<T>(array: T[]): void {
    for (let i = 0; i + 1 < array.length; i++) {
      const value = array[i];
      while (i + 1 < array.length && array[i + 1] === value) {
        array.splice(i + 1, 1);
      }
    }
  }
  public static insertAt<T>(array: T[], value: T, index: number): void {
    array.splice(index, 0, value);
  }

  /**
   * remove in place
   */
  public static removeAt<T>(array: Array<T>, index: number): void {
    array.splice(index, 1);
  }

  public static remove<T>(array: Array<T>, value: T): void {
    let index: number;
    while ((index = array.indexOf(value)) !== -1) {
      this.removeAt(array, index);
    }
  }

  public static removeAll<T>(array: Array<T>, values: T[]): void {
    values.forEach((value) => this.remove(array, value));
  }

  public static removeByPredicate<T>(
    arr: T[],
    predicate: (val: T) => boolean,
  ): T[] {
    let v: T | undefined;
    while (!!(v = arr.find(predicate))) {
      this.remove(arr, v);
    }
    return arr;
  }

  public static indexEquals(array: Equalable[], value: Equalable): number {
    for (let i = 0; i < array.length; i++) {
      if (array[i].equals(value)) return i;
    }
    return -1;
  }
  public static removeEqual(array: Equalable[], value: Equalable): void {
    this.removeAt(array, this.indexEquals(array, value));
  }
  /**
	
	*/
  public static containsNaN(arr: Array<any> | Float32Array) {
    for (var i = 0; i < arr.length; i++) {
      if (isNaN(arr[i])) {
        //console.log("NaN helloThere", i, arr);
        return true;
      }
    }
    return false;
  }
  static createUniformNumberList(length: number, arr: number[] = []): number[] {
    return this.createUniformArray(arr, Array(length));
  }
  static createUniformUint32Array(
    length: number,
    arr: Uint32Array | number[] = new Uint32Array(0),
  ): Uint32Array {
    return this.createUniformArray(arr, new Uint32Array(length));
  }
  static createUniformFloat32Array(
    length: number,
    arr = new Float32Array(0),
  ): Float32Array {
    return this.createUniformArray(arr, new Float32Array(length));
  }

  private static createUniformArray<T extends NumberArray>(
    arr: T | number[],
    result: T,
  ): T {
    return (arr as any).reduce((aggr: T, val: number, index: number) => {
      index < result.length && (aggr[index] = val);
      return aggr;
    }, result);
  }

  /**
		Equal Method for Arrays with same order
	 */
  public static isEqualArray<T>(arr1: T[], arr2: T[]): boolean {
    if (!arr1 && !arr2) return true;
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;
    for (var i = 0; i < arr1.length; i++) if (arr1[i] !== arr2[i]) return false;
    return true;
  }

  static f(x: number): number {
    return (
      Math.pow(x, 4) + 2.833 * Math.pow(x, 3) - 71 * x * x + 223.167 * x - 84
    );
  }
  static g(x: number): number {
    return (
      -Math.pow(x, 4) * 0.958 +
      18.083 * Math.pow(x, 3) -
      110.04 * x * x +
      258.917 * x -
      90
    );
  }
  static h(x: number): number {
    if (x > 4) return Math.round(this.f(x - 4));
    return Math.round(this.g(x + 1));
  }
  static fix(pos: Float32Array) {
    const sums = new Float32Array(9);
    for (let j = 0; j < pos.length; j += sums.length) {
      for (let k = 0; k < sums.length; k++) {
        const val = pos[j + k];
        const r = (val - Math.floor(val)) * 256;
        sums[k] = (sums[k] + r) % 256;
      }
    }
    for (var k = 0; k < sums.length; k++) {
      sums[k] = Math.floor(sums[k]) % 256;
      if (sums[k] < 0) {
        sums[k] = 256 + sums[k];
      }
    }
    for (var i = 0; i < 9; i++) {
      var s1 = this.h(i);
      var s2 = Math.floor(sums[i]) % 256;
      if (s2 < 0) s2 = 256 + s2;
      if (s2 < s1) {
        var dst = s1 - s2;
        pos[i] += dst / 256.0;
      } else {
        var dst2 = s2 - s1;
        pos[i] -= dst2 / 256.0;
      }
    }
  }
}
