// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import type { FrameInput, Axis } from './types.js';
export type Action = 'left' | 'right' | 'up' | 'down' | 'jump';
/** Keyboard, pointer and assistive clicks share actions, not DOM events. */
export class InputBuffer {
  private held = new Map<string, Set<Action>>();
  private jumpQueued = false;
  isHeld(action: Action): boolean { return [...this.held.values()].some(actions => actions.has(action)); }
  set(source: string, action: Action, down: boolean): void {
    const wasHeld = this.isHeld(action);
    const actions = this.held.get(source) ?? new Set<Action>();
    if (down) actions.add(action); else actions.delete(action);
    if (actions.size) this.held.set(source, actions); else this.held.delete(source);
    if (action === 'jump' && down && !wasHeld) this.jumpQueued = true;
  }
  release(source: string): void { this.held.delete(source); }
  clear(): void { this.held.clear(); this.jumpQueued = false; }
  sample(): FrameInput {
    const frame = { move: (Number(this.isHeld('right')) - Number(this.isHeld('left'))) as Axis,
      climb: (Number(this.isHeld('down')) - Number(this.isHeld('up'))) as Axis, jump: this.jumpQueued };
    this.jumpQueued = false;
    return frame;
  }
}
