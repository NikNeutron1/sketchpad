import { ArrayUtils } from 'src/app/sketchpad/model/util/ArrayUtils';
import { BeatClickerDevice, IReclickerID, ReclickerDevice } from './heartbeat.types';

const randomWarmColors = [
  '#ff7300', // Original: Vibrant Orange
  '#fc9797', // Original: Soft Coral / Pastel Red
  '#ffb703', // Added: Bright Sun Yellow
  '#d62828', // Added: Deep Fire Engine Red
  '#ff4d6d', // Added: Electric Pinkish-Red
  '#e36414', // Added: Burnt Orange
  '#9b2226', // Added: Rich Terracotta / Maroon
];
const randomWarmColorsRGB = [
  '255, 115, 0', // #ff7300
  '252, 151, 151', // #fc9797
  '255, 183, 3', // #ffb703
  '214, 40, 40', // #d62828
  '255, 77, 109', // #ff4d6d
  '227, 100, 20', // #e36414
  '155, 34, 38', // #9b2226
] as const;
function getRandomWarm(): `${number}, ${number}, ${number}` {
  const index = Math.floor(Math.random() * randomWarmColors.length);
  return randomWarmColorsRGB[index];
}

export const HeartBeatSetup = {
  beatclickers: [
    new BeatClickerDevice(
      'BC-1',
      'PurpleHaze',
      ArrayUtils.range(8).map((index) => ({
        index,
        x: index - 3,
        right: index === 3,
        gpPin: 0,
        level: 0,
        colorRaw: '0, 229, 255',
      })),
      {
        color: 'Aqua',
      },
    ),
    new BeatClickerDevice(
      'BC-2',
      'Rose',
      ArrayUtils.range(12).map((index) => ({
        index,
        x: index - 5,
        right: index === 5,
        gpPin: 0,
        level: 0,
        colorRaw: '255, 0, 208',
      })),
      {
        color: 'DeepPink',
      },
    ),
    new BeatClickerDevice(
      'BC-3',
      'Sonnenblume',
      ArrayUtils.range(12).map((index) => ({
        index,
        x: index - 5,
        right: index === 5,
        gpPin: 0,
        level: 0,
        colorRaw: '255, 255, 255',
      })),
      {
        color: 'white',
      },
    ),
    new BeatClickerDevice(
      'BC-4',
      'Kornblume',
      ArrayUtils.range(8).map((index) => ({
        index,
        x: index - 4,
        right: index === 4,
        gpPin: 0,
        colorRaw: '0, 77, 208',
      })),
      {
        color: 'DeepPink',
      },
    ),
  ],

  reclickers: ['Kornblume', 'Lilie', 'Lotus', 'Löwenzahn', 'Gänseblümchen'].map(
    (name, index) =>
      new ReclickerDevice(
        ('RC-' + index) as IReclickerID,
        name,
        ArrayUtils.range(3).map((i) => ({
          colorRaw: getRandomWarm(),
          gpPin: 0,
          index: i,
        })),
      ),
  ),
};
