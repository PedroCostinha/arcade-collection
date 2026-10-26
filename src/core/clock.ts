import { FIXED_DT } from './level.js';
/** Bounded accumulator: at most twelve physics steps per display frame. */
export class FixedClock {
  private accumulated = 0;
  reset(): void { this.accumulated = 0; }
  advance(seconds: number, step: () => void): number {
    if (!Number.isFinite(seconds) || seconds < 0) return 0;
    this.accumulated += Math.min(seconds, .1);
    let count = 0;
    while (this.accumulated + 1e-10 >= FIXED_DT && count < 12) {
      step(); this.accumulated -= FIXED_DT; count++;
    }
    this.accumulated = Math.max(0, this.accumulated);
    return count;
  }
}
