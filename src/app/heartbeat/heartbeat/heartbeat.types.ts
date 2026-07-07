import { IHexColor } from 'src/app/sketchpad/model/types';

export interface IWave {
  t0: number; // miliseconds
  speed: number; // light per second
  spawnPos: number;
  width: number; // lights
  brigthness: number;
  direction: 'E' | 'W' | 'EW';
}

export interface IBackgroundWave {
  wave: IWave;
  keyFrames: Array<{ dt: number; level: number }>;
}

export interface ILight {
  index: number;
  gpPin: 0;

  colorRaw: '255, 0, 208' | '0, 229, 255' | '0, 77, 208' | `${number}, ${number}, ${number}`;
  right?: boolean;

  x?: number; // integer -7 bis +7
  level?: number; // 0 bis 1
}

export interface IRecording {
  t_end: number;
  waves: IWave[];
  wavesBg: IBackgroundWave[];
  isPlaying: boolean;
}

export type ILoopRun = {
  waves: IWave[];
  wavesBg: IBackgroundWave[];
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
