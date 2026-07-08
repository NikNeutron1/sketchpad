import { IWave } from '../model/heartbeat.types';

export class HeartBeatSettings {
  static getSettings(): {
    [key in 'speed' | 'default' | 'out']: Partial<{
      directions: IWave['direction'][];
      spawnPos: number[];
      speeds: number[];
      brigthness: number[];
      widths: number[];
    }>;
  } {
    return {
      speed: {
        directions: ['E', 'E', 'W', 'W'],
        spawnPos: [4, 0, 0, 4],
        speeds: [8],
        brigthness: [0.5],
      },
      default: {
        speeds: [17, 21, 14],
        brigthness: [1],
        widths: [5],
        directions: ['EW', 'EW', 'EW', 'EW', 'E', 'E', 'W', 'W'],
        spawnPos: [0, 0, 4, 0, 4, 0, -1, 4],
        //directions: ['W'],
        //spawnPos: [0],
      },
      out: {
        speeds: [5],
        widths: [3.5],
      },
    };
  }

  static getBackgroundKeyFrames(recordingOn: boolean) {
    const keyframesDefault = [
      { dt: 0, level: 0.22 },
      { dt: 1, level: 0.22 },
      { dt: 1_000, level: 0.22 },
      { dt: 2_000, level: 0.2 },
      { dt: 4_000, level: 0.15 },
      { dt: 6_000, level: 0.1 },
      { dt: 8_000, level: 0.07 },
      { dt: 10_000, level: 0 },
    ];
    const keyFramesRecording = [
      { dt: 0, level: 0.22 },
      { dt: 1, level: 0.22 },
      { dt: 600, level: 0.22 },
      { dt: 1_000, level: 0.2 },
      { dt: 1_200, level: 0.1 },
      { dt: 1_450, level: 0.07 },
      { dt: 1_700, level: 0 },
    ];
    return recordingOn ? keyFramesRecording : keyframesDefault;
  }
}
