import { Injectable } from '@angular/core';
import { ILoopRun, IWave } from '../model/heartbeat.types';

@Injectable({ providedIn: 'root' })
export class HeartbeatService {

  private copyLoop(loop: ILoopRun): ILoopRun {
    return structuredClone(loop);
  }

  extractTime(loop: ILoopRun): typeof res {
    const waves = loop.waves;
    const n = waves.length;
    const t0_rec = waves[0].t0;
    const tn_rec = waves.reduce((max, wave) => Math.max(max, wave.t0), 0);
    const dt_rec = tn_rec - t0_rec;
    const now = Date.now();
    const dt_total = now - t0_rec;
    const num_lapsed_loops = Math.floor(dt_total / dt_rec);
    const dt_now = dt_total - num_lapsed_loops * dt_rec;
    const res = { t0_rec, tn_rec, dt_rec, dt_now, num_lapsed_loops } as const;
    return res;
  }

  resetCycle(loop: ILoopRun, cycle = this.extractTime(loop).num_lapsed_loops): ILoopRun {
    const { dt_rec } = this.extractTime(loop);
    const copy = this.copyLoop(loop);
    copy.waves.forEach((wave) => (wave.t0 += cycle * dt_rec));
    return copy;
  }

  swapHalfs(loop: ILoopRun): ILoopRun {
    const { dt_rec, t0_rec } = this.extractTime(loop);

    const copy = this.copyLoop(loop);

    copy.waves.forEach((wave) => {
      const isFirstHalf = wave.t0 < t0_rec + dt_rec / 2;
      wave.t0 = Math.floor(wave.t0 + (isFirstHalf ? dt_rec / 2 : -dt_rec / 2));
    });

    copy.waves.unshift({
      t0: t0_rec,
      bgKeyFrames: [
        { level: 0, dt: 0 },
        { level: 0, dt: 2 },
        { level: 0, dt: 1 },
      ],
      brigthness: 0,
      direction: 'EW',
      spawnPos: 0,
      speed: 1,
      width: 1,
    });
    copy.waves.push({
      t0: t0_rec + dt_rec,
      bgKeyFrames: [
        { level: 0, dt: 0 },
        { level: 0, dt: 2 },
        { level: 0, dt: 1 },
      ],
      brigthness: 0,
      direction: 'EW',
      spawnPos: 0,
      speed: 1,
      width: 1,
    });

    return copy;
  }

  mergeLoops(loop1: ILoopRun, loop2: ILoopRun): ILoopRun {
    return {
      waves: [...loop1.waves, ...loop2.waves],
    };
  }

  padStart(loop: ILoopRun): ILoopRun {
    const copy = this.copyLoop(loop);
    const cycles = this.extractTime(loop).num_lapsed_loops;
    const padding = this.resetCycle(copy, cycles - 1);

    return this.mergeLoops(copy, padding);
  }

  mirror(loop: ILoopRun): ILoopRun {
    const copy = this.copyLoop(loop);
    copy.waves.forEach((wave) => {
      wave.spawnPos = -wave.spawnPos;
      if (wave.direction === 'E') {
        wave.direction = 'W';
      } else if (wave.direction === 'W') {
        wave.direction = 'E';
      }
    });
    return copy;
  }

  mirrorDirections(loop: ILoopRun): ILoopRun {
    const copy = this.copyLoop(loop);
    copy.waves.forEach((wave) => {
      if (wave.direction === 'E') {
        wave.direction = 'W';
      } else if (wave.direction === 'W') {
        wave.direction = 'E';
      }
    });
    return copy;
  }

  moveAxis(loop: ILoopRun, x_center: number) {
    const copy = this.copyLoop(loop);
    copy.waves.forEach((wave) => (wave.spawnPos += x_center));
    return copy;
  }

  private isTrashReady(wave: IWave): boolean {
    const dtn = wave.bgKeyFrames[wave.bgKeyFrames.length - 1].dt;
    return Date.now() - (wave.t0 + dtn) > 1_000 * 30;
  }

  cleanupLoop(loop: ILoopRun): void {
    loop.waves = loop.waves.filter((w) => this.isTrashReady(w) === false);
  }

  intersectsWave(lightX: number, wave: IWave, now: number): typeof result {
    const hasEast = wave.direction.includes('E');
    const hasWest = wave.direction.includes('W');
    const spawnAt = wave.spawnPos;
    let xEast = lightX;
    let xWest = lightX;
    let dt = (now - wave.t0) / 1000.0;
    let dtEast = dt;
    if (lightX < wave.spawnPos && hasEast) {
      //dtEast = dt + 1 / wave.speed;
    }
    if (lightX >= wave.spawnPos && hasWest) {
      //xWest++;
    }

    const traveled = dt * wave.speed;
    const traveledEast = dtEast * wave.speed;
    const waveEastPeak = spawnAt + traveledEast;
    const waveWestPeak = spawnAt - traveled;
    const waveEastEnd = waveEastPeak - wave.width;
    const waveWestEnd = waveWestPeak + wave.width;

    const intersectsEast =
      hasEast && xEast >= wave.spawnPos && xEast <= waveEastPeak && xEast >= waveEastEnd;
    const intersectsWest =
      hasWest && xWest <= wave.spawnPos && xWest >= waveWestPeak && xWest <= waveWestEnd;

    const result = {
      intersectsEast,
      intersectsWest,
      waveEastEnd,
      waveEastPeak,
      waveWestEnd,
      waveWestPeak,
      xEast,
      xWest,
      traveled,
    };
    return result;
  }

  calcWave(
    lightX: number,
    wave: IWave,
    now = Date.now(),
    options = { wave: true, bg: true },
  ): number {
    let result = 0;
    const { intersectsEast, intersectsWest, waveEastPeak, waveWestPeak, xEast, xWest, traveled } =
      this.intersectsWave(lightX, wave, now);

    let distance = wave.width;
    if (intersectsEast) {
      distance = xEast - waveEastPeak;
    } else if (intersectsWest) {
      distance = waveWestPeak - xWest;
    }

    const ratio = Math.max(0, distance) / wave.width;

    const fade =
      (intersectsEast || intersectsWest) && traveled > 2
        ? Math.max(0, 1 - Math.max((traveled - 2) / 13, 0.2))
        : 1;

    result = (1 - Math.max(ratio, 0)) * fade;

    const bg = this.calcWaveBackground(lightX, wave, now);

    const level = options.wave && result * wave.brigthness;
    if (level) {
      return Math.max(level, bg);
    }
    if (!options.bg) {
      return 0;
    }
    return bg;
  }

  private calcWaveBackground(lightX: number, wave: IWave, now = Date.now()): number {
    const { waveEastPeak, waveWestPeak } = this.intersectsWave(lightX, wave, now);

    const lastKeyframe = wave.bgKeyFrames
      .filter((frame) => wave.t0 + frame.dt <= now)
      .reduce((aggr, v) => (v.dt > (aggr?.dt ?? 0) ? v : aggr), null);

    if (!lastKeyframe) {
      return 0;
    }
    const lastIndex = wave.bgKeyFrames.indexOf(lastKeyframe);
    if (lastIndex < 1) {
      return 0;
    }
    const keyFrameBefore = wave.bgKeyFrames[lastIndex - 1];
    const levelBefore = keyFrameBefore.level;
    const levelAfter = lastKeyframe.level;

    const tWaveStarted = wave.t0 + lastKeyframe.dt;
    if (tWaveStarted > Date.now()) {
      return 0;
    }

    const dt = Date.now() - tWaveStarted;
    const traveled = (dt / 1000.0) * wave.speed;

    const isEast =
      wave.direction.includes('E') && wave.spawnPos <= lightX && waveEastPeak >= lightX;
    if (isEast) {
      const bgPivot = wave.spawnPos + traveled;
      const isBehindWave = bgPivot >= lightX;
      return isBehindWave ? levelAfter : levelBefore;
    }

    const isWest =
      wave.direction.includes('W') && wave.spawnPos >= lightX && waveWestPeak <= lightX;
    if (isWest) {
      const bgPivot = wave.spawnPos - traveled;
      const isBehindWave = bgPivot <= lightX;
      return isBehindWave ? levelAfter : levelBefore;
    }
    return 0;
  }
}
