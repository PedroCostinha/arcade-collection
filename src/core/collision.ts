// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
export function clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, value)); }
export function approach(value: number, target: number, amount: number): number {
  return value < target ? Math.min(value + amount, target) : Math.max(value - amount, target);
}
/** Segment against an expanded player box, in player-relative coordinates.
 * Both bodies' motion is included; a fast crossing cannot tunnel between frames.
 */
export function sweptBarrelHit(ax: number, ay: number, bx: number, by: number,
  halfWidth: number, height: number, radius: number): boolean {
  let enter = 0, leave = 1;
  for (const [a, b, min, max] of [[ax, bx, -halfWidth - radius, halfWidth + radius],
    [ay, by, -height - radius, radius]]) {
    const delta = b! - a!;
    if (Math.abs(delta) < 1e-9) { if (a! < min! || a! > max!) return false; }
    else {
      let low = (min! - a!) / delta, high = (max! - a!) / delta;
      if (low > high) [low, high] = [high, low];
      enter = Math.max(enter, low); leave = Math.min(leave, high);
      if (enter > leave) return false;
    }
  }
  return true;
}
