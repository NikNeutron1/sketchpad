import { IHexColor } from 'src/app/sketchpad/model/types';

export type IWave = {
  t0: number; // miliseconds
  speed: number; // light per second
  spawnPos: number;
  width: number; // lights
  brigthness: number;
  direction: 'E' | 'W' | 'EW';
  bgKeyFrames: IBgKeyFrame[];
};

export type IBgKeyFrame = { dt: number; level: number };

export interface ILight {
  index: number;
  gpPin: 0;

  colorRaw: '255, 0, 208' | '0, 229, 255' | '0, 77, 208' | `${number}, ${number}, ${number}`;
  right?: boolean;

  x?: number; // integer -7 bis +7
  level?: number; // 0 bis 1
}

export type IRecording = ILoopRun;

export type ILoopRun = {
  waves: IWave[];
};

export interface ISignalRyhtm {
  t0: number;
  dt1_blink_1_start: number;
  dt2_blink_1_end: number;
  dt3_blink_2_start: number;
  dt4_blink_2_end: number;
}

type IDeviceOptions = { color: string } | { colors: string[] };

export class BeatClickerDevice {
  public readonly type = 'BeatClicker';
  constructor(
    public readonly id: string,
    public name: string,
    public lights: ILight[],
    public options: IDeviceOptions,
  ) {}
  getColor(light: ILight) {
    if ('color' in this.options) {
      return this.options.color;
    } else {
      return this.options.colors[this.lights.indexOf(light)];
    }
  }
}

export type IReclickerID = `RC-${number}`;

export type IReclickerLightMapping = {
  [id in IReclickerID]: Int8Array;
};

const orange: IHexColor = '#ff8800' as IHexColor;

export class ReclickerDevice {
  public readonly type = 'Reclicker';
  constructor(
    public readonly id: IReclickerID,
    public name: string,
    public lights: ILight[], // [ILight, ILight, ILight],
    public options: Partial<{ colors: [IHexColor, IHexColor, IHexColor] }> = {},
  ) {}

  assign(mapping: IReclickerLightMapping) {
    const arr_x = mapping[this.id];
    for (let i = 0; i < this.lights.length; i++) {
      this.lights[i].x = arr_x[i];
    }
  }
}
