import { Algebra } from './algebra';
import { Point2D } from './point-2d';

describe('Point2D', () => {
  describe('equals', () => {
    it('should return true for two equal points', () => {
      const p1 = Algebra.createPoint2D(32, 15);
      const p2 = Algebra.createPoint2D(32, 15);

      expect(Point2D.equals(p1, p2)).toBeTruthy();
    });
    it('should return false for two non-equal points', () => {
      const p1 = Algebra.createPoint2D(10, 20);
      const pX = Algebra.createPoint2D(11, 20);
      const pY = Algebra.createPoint2D(10, 21);
      const pXY = Algebra.createPoint2D(11, 21);
      expect(Point2D.equals(p1, pX)).toBeFalsy();
      expect(Point2D.equals(p1, pY)).toBeFalsy();
      expect(Point2D.equals(p1, pXY)).toBeFalsy();
    });
  });

  describe('add', () => {
    it('adds to points and writes the result into a new point', () => {
      const p1 = Algebra.createPoint2D(32, 15);
      const p2 = Algebra.createPoint2D(3, 7);

      const result = Point2D.add(p1, p2);
      const expected = Algebra.createPoint2D(35, 22);

      expect(Point2D.equals(result, expected)).toBeTruthy();
      expect(Point2D.equals(p1, Algebra.createPoint2D(32, 15))).toBeTruthy();
      expect(Point2D.equals(p2, Algebra.createPoint2D(3, 7))).toBeTruthy();
    });

    it('adds to points and writes the result into the second point', () => {
      const p1 = Algebra.createPoint2D(32, 15);
      const p2 = Algebra.createPoint2D(3, 7);

      const result = Point2D.add(p1, p2, p2);
      const expected = Algebra.createPoint2D(35, 22);

      expect(Point2D.equals(result, expected)).toBeTruthy();
      expect(Point2D.equals(p1, Algebra.createPoint2D(32, 15))).toBeTruthy();
      expect(Point2D.equals(p2, Algebra.createPoint2D(3, 7))).toBeFalsy();
      expect(result).toBe(p2);
    });
  });
});
