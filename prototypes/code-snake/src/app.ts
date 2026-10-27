// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import { SnakeGame, TICK, type Direction } from './core.js';
import { draw } from './render.js';
const game = new SnakeGame();
const canvas = document.querySelector<HTMLCanvasElement>('canvas')!;
const ctx = canvas.getContext('2d')!;
const play = document.querySelector<HTMLButtonElement>('#play')!;
const pause = document.querySelector<HTMLButtonElement>('#pause')!;
const status = document.querySelector<HTMLElement>('#status')!;
const score = document.querySelector<HTMLElement>('#score')!;
const reduced = document.querySelector<HTMLInputElement>('#reduced')!;
const media = matchMedia('(prefers-reduced-motion: reduce)');
reduced.checked = media.matches;
media.addEventListener('change', e => { reduced.checked = e.matches; });
let elapsed = 0, last = 0, previousStatus = '';
function sync() {
  score.textContent = String(game.score).padStart(4, '0');
  pause.disabled = !['playing', 'paused'].includes(game.status);
  pause.textContent = game.status === 'paused' ? 'Continuar' : 'Pausar';
  play.textContent = game.status === 'menu' ? 'Iniciar partida' : 'Reiniciar';
  if (previousStatus !== game.status) {
    previousStatus = game.status;
    status.textContent = ({ menu: 'Pronto, Nib? Colete núcleos e deixe espaço para crescer.', playing: 'Em movimento. Cada núcleo vale 10 pontos.', paused: 'Partida pausada. Continue quando quiser.', over: 'Fim de partida. Seu percurso terminou; tente uma nova rota.', won: 'Grade completa! Nib coletou todos os núcleos.' })[game.status];
  }
}
play.addEventListener('click', () => { game.reset(); elapsed = 0; sync(); canvas.focus(); });
function togglePause() {
  if (game.status === 'paused') { game.resume(); canvas.focus(); }
  else game.pause();
  elapsed = 0; sync();
}
pause.addEventListener('click', togglePause);
const keys: Record<string, Direction> = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
canvas.addEventListener('keydown', event => {
  if (keys[event.key]) { event.preventDefault(); if (!event.repeat) game.turn(keys[event.key]!); }
  if ((event.key === 'Escape' || event.key.toLowerCase() === 'p') && !event.repeat) { event.preventDefault(); togglePause(); }
});
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-direction]')) {
  // Native click supports touch, mouse, Enter, Space, and assistive technology.
  button.addEventListener('click', () => { game.turn(button.dataset.direction as Direction); canvas.focus({ preventScroll: true }); });
}
const autoPause = () => { game.pause(); elapsed = 0; sync(); };
window.addEventListener('blur', autoPause);
document.addEventListener('visibilitychange', () => { if (document.hidden) autoPause(); });
function frame(now: number) {
  const delta = last ? Math.min(now - last, TICK) : 0; last = now;
  if (game.status === 'playing') {
    elapsed += delta;
    if (elapsed >= TICK) { game.step(); elapsed -= TICK; sync(); }
  }
  // One-tick interpolation follows completed, validated moves, never predicts a wall crossing.
  draw(ctx, game, reduced.checked || game.status !== 'playing' ? 1 : Math.min(1, elapsed / TICK));
  requestAnimationFrame(frame);
}
sync(); requestAnimationFrame(frame);
