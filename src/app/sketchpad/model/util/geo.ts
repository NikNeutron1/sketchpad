import { IPoint3D, IPoint2D, IBounds, ILine } from '../types';
import { Algebra } from './algebra';
import { Bounds } from './bounds';
import { Point2D } from './point-2d';
import { Point3D } from './point-3d';

/*
  Short Geodreieck
*/
export class Geo {
  public static distance2D(x1: number, y1: number, x2: number, y2: number) {
    var x = x1 - x2;
    var y = y1 - y2;
    return Math.sqrt(x * x + y * y);
  }

  public static pathLength3D(points: IPoint3D[]): number {
    var dst = 0;
    var p1, p2;
    for (var i = 1; i < points.length; i++) {
      p1 = points[i - 1];
      p2 = points[i];
      dst += Point3D.dst(p1, p2);
    }
    return dst;
  }

  public static pathLength2D(points: IPoint2D[]): number {
    var dst = 0;
    var p1, p2;
    for (var i = 1; i < points.length; i++) {
      p1 = points[i - 1];
      p2 = points[i];
      dst += Point2D.dst(p1, p2);
    }
    return dst;
  }

  public static pathWalk2D(
    points: IPoint2D[],
    length: number,
  ): IPoint2D | null {
    //Neu
    var dst = 0;
    var p1, p2;
    for (var i = 1; i < points.length; i++) {
      p1 = points[i - 1];
      p2 = points[i];
      dst = Point2D.dst(p1, p2);
      if (dst >= length) {
        return Geo.pointBetween(p1, p2, length);
      } else {
        length -= dst;
      }
    }
    return null;
  }
  /**
		input 	point
				alpha = angle relative to north
				length = float
		output	new point
	*/
  public static lookAt(point: IPoint2D, alpha: number, length = 1): IPoint2D {
    var alpha = (alpha * Math.PI) / 180;
    var x = -Math.sin(alpha);
    var y = Math.cos(alpha);
    x *= length;
    y *= length;
    return { x: point.x + x, y: point.y + y };
  }
  private static prod: IPoint2D = Algebra.createPoint2D(0, 0);
  private static isLeft(point: IPoint2D, line: ILine): boolean {
    //Solves Equation point = p1 + x * p1p2 + y * n1
    var p1 = line.p1;
    var p1p2 = line.p1p2;
    var n1 = line.n1;
    Geo.uv_coord(point, p1, p1p2, n1, this.prod);
    return this.prod.y < 0;
  }
  public static clip(points: IPoint2D[], line: ILine): IPoint2D[] | null {
    var points2: IPoint2D[];
    var p: IPoint2D;
    var p1: IPoint2D;
    var p2: IPoint2D;
    var p1p2 = Algebra.createPoint2D();
    var start: number, index_1: number, index_2: number;

    start = 0;
    while (!Geo.isLeft(points[start], line)) {
      start++;
      if (start == points.length) {
        return null;
      }
    }
    points2 = [];

    for (var i = 0; i < points.length; i++) {
      index_1 = (i + start) % points.length;
      index_2 = (i + start + 1) % points.length;
      p1 = points[index_1];
      p2 = points[index_2];
      Point2D.sub(p2, p1, p1p2);
      if (Geo.isLeft(p1, line) && !Geo.isLeft(p2, line)) {
        //a + x * b = c + y * d
        //this.intersectionLines = function(a, b, c, d)
        p = Algebra.createPoint2D();
        Geo.intersectionLines(p1, p1p2, line.p1, line.p1p2, p);
        points2.push(p1);
        points2.push(p);
      } else if (!Geo.isLeft(p1, line) && !Geo.isLeft(p2, line)) {
        continue;
      } else if (!Geo.isLeft(p1, line) && Geo.isLeft(p2, line)) {
        //p = INDOORNAV.Math.intersectBorder(p1, p2, border, false);
        p = Algebra.createPoint2D();
        Geo.intersectionLines(p1, p1p2, line.p1, line.p1p2, p);
        points2.push(p);
        if (i == points.length - 1) points2.push(p2);
      } else {
        //isLeft(p1, line) && isLeft(p2, line)
        points2.push(p1);
      }
    }
    points = points2;

    return points2;
  }
  //added 15.9.18
  private static p1p3 = Algebra.createPoint2D();
  private static n = Algebra.createPoint2D();
  private static tmpResult = Algebra.createPoint2D();
  /*
		checks for situation
		p1 ---- p2 --- p3 colinear
	*/
  public static isCloseBetween(
    p1: IPoint2D,
    p2: IPoint2D,
    p3: IPoint2D,
    err: number,
  ): boolean {
    Point2D.sub(p3, p1, this.p1p3);
    Point2D.rotate90(Geo.p1p3, this.n);
    Point2D.normalize(this.n, 1, this.n);
    this.uv_coord(p2, p1, this.p1p3, this.n, this.tmpResult);
    const alpha = this.tmpResult.x;
    const beta = this.tmpResult.y;
    const a = 0 <= alpha && alpha <= 1.0;
    const b = 0 <= Math.abs(beta) && Math.abs(beta) <= err;
    return a && b;
  }
  public static getOrthogonalDistance(
    p1: IPoint2D,
    p2: IPoint2D,
    p3: IPoint2D,
  ): number {
    Point2D.sub(p3, p1, this.p1p3);
    Point2D.rotate90(Geo.p1p3, this.n);
    Point2D.normalize(this.n, 1, this.n);
    this.uv_coord(p2, p1, this.p1p3, this.n, this.tmpResult);
    const beta = this.tmpResult.y;
    return Math.abs(beta);
  }
  /**
   * relocates p3 between p1 and p2
   */
  public static alignPoint(p1: IPoint2D, p2: IPoint2D, p3: IPoint2D): void {
    Point2D.sub(p2, p1, this.p1p2);
    Point2D.rotate90(this.p1p2, this.n);
    Point2D.normalize(this.n, 1, this.n);
    this.uv_coord(p3, p1, this.p1p2, this.n, this.tmpResult);
    const alpha = this.tmpResult.x;
    p3.x = p1.x + alpha * this.p1p2.x;
    p3.y = p1.y + alpha * this.p1p2.y;
  }
  /*
	public static isCloseBetween(p1: IPoint2D, p2: IPoint2D, p3: IPoint2D, err: number): boolean{
		Geo.p1p2.sub(p2, p1);
		Geo.p1p3.sub(p3, p1);
		const dst1 = Geo.p1p2.size();
		const dst2 = Geo.p1p3.size();
		// const p4 = Point2D.mul(Geo.p1p2, 1.0/dst1);
		// const p5 = Point2D.mul(Geo.p1p3, 1.0/dst2);
		Geo.p1p2.mul(Geo.p1p2, 1.0/dst1);
		Geo.p1p3.mul(Geo.p1p3, 1.0/dst2);
		
		// const a = Geo.isClose(p4, p5, err); //Richtung passt
		const a = Geo.isClose(Geo.p1p2, Geo.p1p3, err); //Richtung passt
		const b = dst2 - err <= dst1;        //Echt dazwischen
		
		if(a && b){
			console.log(p1, p2, p3, '#', JSON.stringify(Geo.p1p2), JSON.stringify(Geo.p1p3));
		}

		return a && b;
	}
	*/
  //added 15.9.18
  public static consecutivelyLines(
    p1: IPoint2D,
    p2: IPoint2D,
    p3: IPoint2D,
    p4: IPoint2D,
    err: number,
  ): boolean {
    var a = Geo.isCloseBetween(p1, p2, p3, err);
    if (a == false) {
      a = Geo.isCloseBetween(p1, p2, p4, err);
      if (a == false) return false;
    }

    return (
      Geo.isCloseParallel(p1, p2, p3, p4, err) ||
      Geo.isCloseParallel(p1, p2, p4, p3, err)
    );
  }
  //added 15.9.18
  private static p1p2 = Algebra.createPoint2D(0, 0);
  private static p3p4 = Algebra.createPoint2D(0, 0);
  private static p4 = Algebra.createPoint2D(0, 0);
  private static p5 = Algebra.createPoint2D(0, 0);
  public static isCloseParallel(
    p1: IPoint2D,
    p2: IPoint2D,
    p3: IPoint2D,
    p4: IPoint2D,
    err: number,
  ): boolean {
    Point2D.sub(p2, p1, Geo.p1p2);
    Point2D.sub(p4, p3, Geo.p3p4);
    var dst1 = Point2D.size(Geo.p1p2);
    var dst2 = Point2D.size(Geo.p3p4);
    Point2D.mul(Geo.p1p2, 1.0 / dst1, Geo.p4);
    Point2D.mul(Geo.p3p4, 1.0 / dst2, Geo.p5);
    return Geo.isClose(Geo.p4, Geo.p5, err);
  }
  //added 15.9.18
  public static isClose(p1: IPoint2D, p2: IPoint2D, err: number): boolean {
    var x = Math.abs(p2.x - p1.x);
    var y = Math.abs(p2.y - p1.y);
    return x < err && y < err;
  }
  private static vec1 = Algebra.createPoint2D();
  private static vec2 = Algebra.createPoint2D();
  /**
   * TODO result pattern
   */
  public static pointBetween(
    p1: IPoint2D,
    p2: IPoint2D,
    distance: number,
  ): IPoint2D {
    Point2D.sub(p2, p1, this.vec1);
    Point2D.mul(this.vec1, distance / Point2D.size(this.vec1), this.vec2);
    return Point2D.add(p1, this.vec2);
  }
  private static p_normal = Algebra.createPoint3D();
  private static p1 = Algebra.createPoint3D();
  private static p2 = Algebra.createPoint3D();
  public static normal(
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number,
    x3: number,
    y3: number,
    z3: number,
  ): IPoint2D {
    var x4 = x1 - x2;
    var y4 = y1 - y2;
    var z4 = z1 - z2;
    var x5 = x1 - x3;
    var y5 = y1 - y3;
    var z5 = z1 - z3;
    Point3D.set(Geo.p1, x4, y4, z4);
    Point3D.set(Geo.p2, x5, y5, z5);
    Point3D.vectorProduct(Geo.p1, Geo.p2, Geo.p_normal);
    var length = Point3D.size(Geo.p_normal);
    return Point3D.mul(Geo.p_normal, 1.0 / length);
  }
  public static angleBetween2D(vec1: IPoint2D, vec2: IPoint2D): number {
    var scalar = vec1.x * vec2.x + vec1.y * vec2.y;
    var length1 = Point2D.size(vec1);
    var length2 = Point2D.size(vec2);
    var cos = scalar / (length1 * length2);
    return Math.acos(cos);
  }

  /**
		Update 30.4.18
		Solves Equation
		a + x * b = c + y * d
		for 2D-vectors
		returns intersection Point
	*/
  public static intersectionLines(
    a: IPoint2D,
    b: IPoint2D,
    c: IPoint2D,
    d: IPoint2D,
    result: IPoint2D,
  ): string | null {
    /*
		if(d.x == 0){
			var t1 = a;
			var t2 = b;
			a = c;
			b = d;
			c = t1;
			d = t2;
		}
		*/

    if (b.x == 0 && d.x == 0) return 'PARRALLEL';
    if (b.y == 0 && d.y == 0) return 'PARRALLEL';

    var term2 = d.y - (d.x / b.x) * b.y;
    if (term2 == 0) {
      return 'PARRALLEL';
      //return {x: (a.x+c.x)/2, y: (a.y+c.y)/2};
    }
    var term1 = a.y - c.y + (b.y * (c.x - a.x)) / b.x;
    var gamma: number;
    if (b.x == 0) {
      //term1 = a.y-c.y+b.y*(c.x-a.x)/0.0001;
      gamma = (a.x - c.x) / d.x;
    } else if (b.y == 0) {
      gamma = (a.y - c.y) / d.y;
    } else {
      gamma = term1 / term2;
    }

    var x = c.x + gamma * d.x;
    var y = c.y + gamma * d.y;

    //if(isNaN(x))
    //	throw "NAN";
    result.x = x;
    result.y = y;

    return null;
  }
  public static intersectionLines2(
    p1: IPoint2D,
    p2: IPoint2D,
    p3: IPoint2D,
    p4: IPoint2D,
    result: IPoint2D,
  ): string | null {
    Point2D.sub(p2, p1, Geo.p1p2);
    Point2D.sub(p4, p3, Geo.p3p4);
    return Geo.intersectionLines(p1, Geo.p1p2, p3, Geo.p3p4, result);
  }

  /**
		29.4.18
		Solves Equation
		p1 + alpha * p1p2 = p3 + beta * p3p3
		for x and y
		returns if Lines intersect between the points
	*/
  private static p_relative_1 = Algebra.createPoint2D();
  private static p_relative_3 = Algebra.createPoint2D();
  private static linesIntersect_result = Algebra.createPoint2D();
  public static linesIntersect(
    p1: IPoint2D,
    p2: IPoint2D,
    p3: IPoint2D,
    p4: IPoint2D,
  ): boolean {
    Point2D.sub(p2, p1, Geo.p1p2);
    Point2D.sub(p4, p3, Geo.p3p4);

    var res = Geo.intersectionLines(
      p1,
      Geo.p1p2,
      p3,
      Geo.p3p4,
      this.linesIntersect_result,
    );

    if (res == 'PARRALLEL') return false;
    var p = this.linesIntersect_result;
    Point2D.sub(p, p1, Geo.p_relative_1);

    if (
      Geo.sgn(Geo.p_relative_1.x) != Geo.sgn(Geo.p1p2.x) ||
      Geo.sgn(Geo.p_relative_1.y) != Geo.sgn(Geo.p1p2.y)
    )
      return false;

    Point2D.sub(p, p3, Geo.p_relative_3);

    if (
      Geo.sgn(Geo.p_relative_3.x) != Geo.sgn(Geo.p3p4.x) ||
      Geo.sgn(Geo.p_relative_3.y) != Geo.sgn(Geo.p3p4.y)
    )
      return false;

    var dst_p1p = Point2D.size(Geo.p_relative_1);
    var dst_p3p = Point2D.size(Geo.p_relative_3);
    var dst_p1p2 = Point2D.size(Geo.p1p2);
    var dst_p3p4 = Point2D.size(Geo.p3p4);

    return dst_p1p < dst_p1p2 && dst_p3p < dst_p3p4;
  }
  public static sgn(a: number): boolean | number {
    if (a > 0) return true;
    else if (a < 0) return false;
    else return -1;
  }
  /**
		???
	 */
  public static linesIntersect2(
    p1: IPoint2D,
    p2: IPoint2D,
    p3: IPoint2D,
    p4: IPoint2D,
  ): boolean {
    var alpha, beta;

    var term1 = p4.y - p3.y - p2.y + p1.y;
    if (term1 == 0) {
      term1 = p4.x - p3.x - p2.x + p1.x;
      alpha = (p1.x - p3.x) / term1;
      beta = alpha;
    } else {
      var term2 = p2.x - p1.x;
      var term3 = ((p2.y - p1.y) * (p3.x - p1.x)) / term2;
      beta = (p1.y - p3.y + term3) / term1;
      alpha = (p3.x - p1.x + beta * (p4.x - p3.x)) / term2;
    }
    return alpha > 0 && alpha < 1 && beta > 0 && beta < 1;
  }
  /**
		12.2.18
		Solves 
		C = A + alpha * AB
		for fix C.x = border or C.y = border
	*/
  public static intersectBorder(
    a: IPoint2D,
    b: IPoint2D,
    border: number,
    horizontal: boolean,
  ): IPoint2D {
    var c = Algebra.createPoint2D(0, 0);
    var alpha;
    if (horizontal) {
      c.y = border;
      alpha = (border - a.y) / (b.y - a.y);
      c.x = a.x + alpha * (b.x - a.x);
    } else {
      //vertikal
      c.x = border;
      alpha = (border - a.x) / (b.x - a.x);
      c.y = a.y + alpha * (b.y - a.y);
    }
    return c;
  }

  /**
   * a + b * alpha + c * beta
   */
  static a_add_b_x_alpha_add_c_x_beta(
    a: IPoint2D,
    alpha: number,
    b: IPoint2D,
    beta: number,
    c: IPoint2D,
  ): IPoint2D {
    return Point2D.add(
      Point2D.add(a, Point2D.mul(b, alpha)),
      Point2D.mul(c, beta),
    );
  }

  public static solve_p_eq_a_add_X_x_b_add_Y_x_c(
    p: IPoint2D,
    a: IPoint2D,
    b: IPoint2D,
    c: IPoint2D,
    result = Algebra.createPoint2D(),
  ): IPoint2D {
    return this.uv_coord(p, a, b, c, result);
  }
  /**
		Update 12.2.18
		Solves Equation p = a + alpha * b + beta * c
		for alpha, beta
	*/
  public static uv_coord(
    p: IPoint2D,
    a: IPoint2D,
    b: IPoint2D,
    c: IPoint2D,
    result = Algebra.createPoint2D(),
  ): IPoint2D {
    if (c.y == 0) {
      if (b.y == 0 && c.x == 0) {
        result.x = 0;
        result.y = 0;
        return result;
        //return Algebra.createPoint2D(0, 0);
      } else if (b.y == 0 || c.x == 0) {
        //console.log("1 nested uv_coord ", b, c);
        console.log('1 nested uv_coord ', b, c);
        //throw new Error('1 nested uv_coord ' + b + c);
      }

      const alpha = (p.y - a.y) / b.y;
      const beta = (p.x - a.x - alpha * b.x) / c.x;

      result.x = alpha;
      result.y = beta;
      return result;
    }

    if (b.x == 0) {
      //console.log("2 nested uv_coord ", b);
      if (c.x == 0) console.log('2.1 nested uv_coord ', b);
      if (b.y == 0) console.log('2.2 nested uv_coord ', b);
      const beta = (p.x - a.x) / c.x;
      const alpha = (p.y - a.y - beta * c.y) / b.y;
      result.x = alpha;
      result.y = beta;
      return result;
    }

    const term1 = c.y - (b.y * c.x) / b.x;
    const term2 = p.y - a.y - (b.y * (p.x - a.x)) / b.x;

    if (term1 == 0) {
      console.log('3 nested uv_coord', b, c);
    }

    const beta = term2 / term1;
    const alpha = (p.x - a.x - beta * c.x) / b.x;

    result.x = alpha;
    result.y = beta;
    return result;
  }

  public static triangleContainsP(
    p1: IPoint2D,
    p2: IPoint2D,
    p3: IPoint2D,
    p: IPoint2D,
  ) {
    return this.triangleContains(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p.x, p.y);
  }

  static triangleContains(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    p_x: number,
    p_y: number,
  ): boolean {
    var abs = Math.abs;
    const a = abs((x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1));
    const b =
      abs((x2 - x1) * (p_y - y1) - (y2 - y1) * (p_x - x1)) +
      abs((x3 - x2) * (p_y - y2) - (y3 - y2) * (p_x - x2)) +
      abs((x1 - x3) * (p_y - y3) - (y1 - y3) * (p_x - x3));
    return abs(a - b) < 0.001;
  }
  public static getClosestPoint3D(points: IPoint3D[], p: IPoint3D): IPoint3D {
    var min = Number.MAX_SAFE_INTEGER;
    var index = -1;
    var dst: number;
    // mh
    for (var i = 0; i < points.length; i++) {
      dst = Point3D.dst(points[i], p);
      if (dst < min) {
        min = dst;
        index = i;
      }
    }
    return points[index];
  }
  private static p3 = Algebra.createPoint2D();

  static polyLineIntersections(points: IPoint2D[], y: number): IPoint2D[] {
    var points2: IPoint2D[] = [];
    var p1: IPoint2D, p2: IPoint2D;
    var h1: number, h2: number;
    //Find Lines Crossing p.x
    for (var i = 1; i < points.length; i++) {
      p1 = points[i - 1];
      p2 = points[i];
      if (p1.y >= y && p2.y < y) {
        h1 = Math.abs(p1.y - y);
        h2 = Math.abs(p1.y - p2.y);
        Point2D.sub(p2, p1, Geo.p3);
        Point2D.mul(Geo.p3, h1 / h2, Geo.p3);
        Point2D.add(Geo.p3, p1, Geo.p3);
        points2.push(Geo.p3);
      } else if (p2.y >= y && p1.y < y) {
        h1 = Math.abs(p1.y - y);
        h2 = Math.abs(p1.y - p2.y);
        Point2D.sub(p1, p2, Geo.p3);
        Point2D.mul(Geo.p3, h1 / h2, Geo.p3);
        Point2D.add(Geo.p3, p2, Geo.p3);
        points2.push(Geo.p3);
      }
    }
    //Sort Left to Right
    function swap(arr: any[], a: number, b: number) {
      var t = arr[a];
      arr[a] = arr[b];
      arr[b] = t;
    }
    if (points2.length > 10) {
      console.log('oh no expensiv sorting is used!');
    }
    for (var i = 0; i < points2.length; i++) {
      for (var j = i; j < points2.length; j++) {
        if (points2[j].x < points2[i].x) {
          swap(points2, i, j);
        }
      }
    }
    return points2;
  }
  public static multiPolyContains(polys: IPoint2D[][], p: IPoint2D): boolean {
    var points2: IPoint2D[] = [];
    var p1: IPoint2D, p2: IPoint2D;
    var h1: number, h2: number;
    //Find Lines Crossing p.x
    for (var j = 0; j < polys.length; j++) {
      var points = polys[j];
      for (var i = 1; i < points.length; i++) {
        p1 = points[i - 1];
        p2 = points[i];
        if (p1.y >= p.y && p2.y < p.y) {
          h1 = Math.abs(p1.y - p.y);
          h2 = Math.abs(p1.y - p2.y);
          Point2D.sub(p2, p1, Geo.p3);
          Point2D.mul(Geo.p3, h1 / h2, Geo.p3);
          Point2D.add(Geo.p3, p1, Geo.p3);
          points2.push(Geo.p3);
        } else if (p2.y >= p.y && p1.y < p.y) {
          h1 = Math.abs(p1.y - p.y);
          h2 = Math.abs(p1.y - p2.y);
          Point2D.sub(p1, p2, Geo.p3);
          Point2D.mul(Geo.p3, h1 / h2, Geo.p3);
          Point2D.add(Geo.p3, p2, Geo.p3);
          points2.push(Geo.p3);
        }
      }
    }
    //Sort Left to Right
    function swap(arr: any[], a: number, b: number) {
      var t = arr[a];
      arr[a] = arr[b];
      arr[b] = t;
    }
    if (points2.length > 10) console.log('oh no expensiv sorting');
    for (var i = 0; i < points2.length; i++) {
      for (var j = i; j < points2.length; j++) {
        if (points2[j].x < points2[i].x) swap(points2, i, j);
      }
    }
    //Determine if p between even and odd
    for (var i = 1; i < points2.length; i++) {
      if (p.x <= points2[i].x && p.x >= points2[i - 1].x) return i % 2 == 1;
    }
    return false;
  }
  public static polyContains(
    points: IPoint2D[],
    p: IPoint2D,
    points2?: IPoint2D[],
  ): boolean {
    if (!points2) {
      points2 = this.polyLineIntersections(points, p.y);
    }

    //Determine if p between even and odd
    for (var i = 1; i < points2.length; i++) {
      if (p.x <= points2[i].x && p.x >= points2[i - 1].x) {
        return i % 2 == 1;
      }
    }
    return false;
  }

  public static circleIntersectsRectangle(
    circleCenter: IPoint2D,
    circleRadius: number,
    rectangle: IBounds,
  ): boolean {
    const boundsCenter = Bounds.center(rectangle);
    const distance1 = Point2D.dst(circleCenter, boundsCenter);
    if (distance1 <= circleRadius) {
      return true;
    } else {
      const apex = this.pointBetween(circleCenter, boundsCenter, circleRadius);
      return Bounds.contains(rectangle, apex);
    }
  }
}
