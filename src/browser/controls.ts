import { InputBuffer, type Action } from '../core/input.js';

const KEYS: Readonly<Record<string, Action>> = Object.freeze({ ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right',
  KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', Space: 'jump' });
export class BrowserControls {
  private abort = new AbortController();
  private pulses = new Set<number>();
  constructor(readonly region: HTMLElement, readonly buffer: InputBuffer,
    readonly canPlay: () => boolean, readonly pause: () => void, readonly onBlur: () => void) {
    const signal = this.abort.signal;
    window.addEventListener('keydown', event => {
      if (!region.contains(document.activeElement) || event.ctrlKey || event.altKey || event.metaKey) return;
      if (event.code === 'KeyP' || event.code === 'Escape') {
        if (!event.repeat) { event.preventDefault(); this.clear(); pause(); }
        return;
      }
      const action = KEYS[event.code];
      if (!action || !canPlay()) return;
      // Space on an HTML button keeps its native activation semantics.
      if (event.code === 'Space' && event.target instanceof HTMLButtonElement) return;
      event.preventDefault(); buffer.set(`key:${event.code}`, action, true);
    }, { signal });
    window.addEventListener('keyup', event => { buffer.release(`key:${event.code}`); }, { signal });
    window.addEventListener('blur', () => { this.clear(); onBlur(); }, { signal });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { this.clear(); onBlur(); } }, { signal });
    for (const button of region.querySelectorAll<HTMLButtonElement>('[data-action]')) {
      const action = button.dataset.action as Action;
      button.addEventListener('pointerdown', event => {
        if (!canPlay()) return;
        event.preventDefault();
        try { button.setPointerCapture(event.pointerId); } catch { /* Synthetic AT events may have no active pointer. */ }
        buffer.set(`pointer:${event.pointerId}`, action, true);
      }, { signal });
      const release = (event: PointerEvent): void => buffer.release(`pointer:${event.pointerId}`);
      for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) button.addEventListener(name, release, { signal });
      button.addEventListener('click', event => {
        if (event.detail !== 0 || !canPlay()) return;
        const source = `activation:${action}`;
        buffer.set(source, action, true);
        const id = window.setTimeout(() => { buffer.release(source); this.pulses.delete(id); }, 160);
        this.pulses.add(id);
      }, { signal });
    }
  }
  clear(): void { this.buffer.clear(); for (const timer of this.pulses) clearTimeout(timer); this.pulses.clear(); }
  dispose(): void { this.clear(); this.abort.abort(); }
}
