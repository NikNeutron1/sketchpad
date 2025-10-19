export type IBlobUrl =
  'blob:https://example.com/ecaee94a-9991-4b46-bb3c-835621a6702f';

export interface IBoundsSize {
  width: number;
  height: number;
}

export interface IPoint2D {
  x: number;
  y: number;
}

export interface IPoint3D {
  x: number;
  y: number;
  z: number;
}

export interface IBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ILine {
  p1: IPoint2D;
  p1p2: IPoint2D;
  n1: IPoint2D;
}

export interface IMatrix4D {
  elements: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];
}

export interface IBounds3dSize {
  width: number;
  height: number;
  depth: number;
}

const fakeDigits16 = ['f'] as const;

export const digit36 = [
  ...['0', '1', '2', '3', '4', '5', '6', '7'],
  ...['8', '9', 'a', 'b', 'c', 'd', 'e', 'f'],
  ...['g', 'h', 'i', 'j', 'k', 'l', 'm', 'n'],
  ...['o', 'p', 'q', 'r', 's', 't', 'u', 'v'],
  ...['w', 'x', 'y', 'z'],
] as const;

export type Char16 = (typeof fakeDigits16)[number];
export type IChar36 = (typeof digit36)[number];

type Join<T extends string[], Separator extends string = ''> = T extends [
  infer First,
  ...infer Rest,
]
  ? First extends string
    ? Rest extends string[]
      ? `${First}${Separator}${Join<Rest, Separator>}`
      : First
    : ''
  : '';

type Repeat<
  T extends string,
  N extends number,
  Acc extends string[] = [],
> = Acc['length'] extends N ? Acc : Repeat<T, N, [...Acc, T]>;

export type StringOfLength<Char extends IChar36, Length extends number> = Join<
  Repeat<Char, Length>
>;

export type IChar36Id = StringOfLength<'z', 8>;

export type IHexColor = `#${StringOfLength<Char16, 6>}`;
