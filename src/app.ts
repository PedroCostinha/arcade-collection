// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import { IDENTITY } from './art/identity.js';
import { Game } from './core/game.js';
import { FixedClock } from './core/clock.js';
import { InputBuffer } from './core/input.js';
import { CanvasRenderer } from './render/canvas.js';
import { BrowserControls } from './browser/controls.js';
import type { State } from './core/types.js';

function element<T extends HTMLElement>(id: string): T {
  const value = document.getElementById(id);
  if (!value) throw new Error(`Missing element: ${id}`);
  return value as T;
}
function boot(): void {
  const canvas = element<HTMLCanvasElement>('game-canvas');
  const renderer = new CanvasRenderer(canvas);
  const game = new Game(), input = new InputBuffer(), clock = new FixedClock();
  let controls: BrowserControls | undefined;
  let previousState: State | null = null, previousEvent = -1, lastTimestamp: number | null = null, dirty = true;
  const overlay = element('screen'), copy = element('screen-copy'), title = element('screen-title');
  const actions = element('screen-actions'), label = element('screen-label');
  const pause = element<HTMLButtonElement>('pause'), restart = element<HTMLButtonElement>('restart');
  const live = element('announcer'), manifest = element('manifest');
  const fields = { score: element('score'), lives: element('lives'), cargo: element('cargo'), time: element('time'),
    floor: element('floor-label'), phase: element('phase'), camera: element('camera-label') };
  const reduced = element<HTMLInputElement>('reduced');
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)'), sizeQuery = matchMedia('(max-width: 640px)');
  const setText = (node: HTMLElement, value: string): void => { if (node.textContent !== value) node.textContent = value; };
  let previousCheckpoint = 0, feedbackUntil = 0, feedbackText = '', feedbackKind = 'hint';
  function missionHint(): string {
    const next = game.deliveries.find(delivery => !delivery.collected);
    return next ? `Próxima carga: piso 0${next.floor + 1}. Recolha as cinco e alcance a bandeira.`
      : 'Cinco cargas entregues. Alcance a bandeira no piso 05 para concluir a missão.';
  }
  for (let floor = 1; floor <= 5; floor++) {
    const item = document.createElement('li'), text = document.createElement('span'), mark = document.createElement('span');
    text.textContent = `PISO 0${floor}`; mark.className = 'cargo-mark'; mark.setAttribute('aria-hidden', 'true');
    item.append(text, mark); manifest.append(item);
  }
  function act(operation: () => void): void {
    operation(); controls?.clear(); clock.reset(); lastTimestamp = null; dirty = true; sync(true);
  }
  function addButton(text: string, operation: () => void, primary = false): void {
    const button = document.createElement('button'); button.type = 'button'; button.className = `button${primary ? ' primary' : ''}`;
    button.textContent = text; button.addEventListener('click', () => act(operation)); actions.append(button);
  }
  function paragraph(text: string): void { const p = document.createElement('p'); p.textContent = text; copy.append(p); }
  function sync(force = false, manageFocus = true): boolean {
    const playing = game.state === 'playing', changed = previousState !== game.state;
    const seconds = Math.floor(game.elapsed);
    setText(fields.score, String(game.score).padStart(6, '0')); setText(fields.lives, `${game.lives} / 3`);
    setText(fields.cargo, `${game.cargo} / 5`);
    setText(fields.time, `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`);
    setText(fields.floor, `PISO 0${game.player.lastFloor + 1} / 05`);
    setText(fields.phase, ({ menu: 'PRONTO', playing: 'EM MISSÃO', paused: 'PAUSADO', instructions: 'INSTRUÇÕES', won: 'CONCLUÍDO', gameover: 'FIM DE JOGO' })[game.state]);
    pause.disabled = game.state !== 'playing' && game.state !== 'paused'; pause.textContent = game.state === 'paused' ? 'Continuar' : 'Pausar';
    restart.disabled = game.state === 'menu' || game.state === 'instructions';
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-action]')) button.disabled = !playing;
    for (let i = 0; i < manifest.children.length; i++) {
      const done = game.deliveries[i]!.collected, item = manifest.children[i]!;
      const className = done ? 'delivered' : '', description = `Piso ${i + 1}: ${done ? 'carga entregue' : 'carga pendente'}`;
      if (item.className !== className) item.className = className;
      if (item.getAttribute('aria-label') !== description) item.setAttribute('aria-label', description);
    }
    if (changed || force) {
      controls?.clear(); overlay.hidden = playing; copy.replaceChildren(); actions.replaceChildren();
      label.textContent = `MISSÃO 01 / ${IDENTITY.CHARACTER_NAME_UPPER}`;
      if (game.state === 'menu') {
        title.textContent = 'ENTREGA\nEM NÍVEL MÁXIMO.';
        paragraph('Colete as cinco cargas e alcance a bandeira. Setas/WASD: mover e subir. Espaço: pular.');
        addButton('Jogar agora', () => game.start(), true); addButton('Como jogar', () => game.instructions());
      } else if (game.state === 'instructions') {
        title.textContent = 'COMO JOGAR'; label.textContent = 'CONTROLES / OBJETIVO';
        const list = document.createElement('ul');
        for (const text of ['Setas ou A/D: andar. Junto à escada, segure W/S ou ↑/↓; solte para parar. Espaço também permite sair saltando.',
          'Espaço: pular. P ou Esc: pausar e continuar.', 'No celular: segure as setas e toque em PULAR. É possível mover e pular ao mesmo tempo.',
          'Recolha as cinco cargas douradas. Chegue à bandeira do último andar para vencer.',
          'Barris e quedas custam uma vida. Você tem três; o retorno usa o piso mais alto alcançado. Ao renascer há 1,8 s de proteção contra barris, não contra quedas.']) {
          const item = document.createElement('li'); item.textContent = text; list.append(item);
        }
        copy.append(list); addButton('Voltar', () => game.closeInstructions(), true);
      } else if (game.state === 'paused') {
        title.textContent = 'MISSÃO EM PAUSA.'; paragraph('Respire. Suas vidas, seu tempo e suas entregas estão preservados.');
        addButton('Continuar missão', () => game.resume(), true); addButton('Como jogar', () => game.instructions()); addButton('Voltar ao menu', () => game.menu());
      } else if (game.state === 'won') {
        title.textContent = 'ENTREGAS\nCONCLUÍDAS.'; label.textContent = 'MISSÃO CUMPRIDA / 5 DE 5';
        paragraph(`Você levou as cinco cargas ao destino. ${game.score} pontos nesta partida, com ${game.lives} ${game.lives === 1 ? 'vida restante' : 'vidas restantes'}.`);
        addButton('Jogar novamente', () => game.start(), true); addButton('Voltar ao menu', () => game.menu());
      } else if (game.state === 'gameover') {
        title.textContent = 'FIM DE JOGO.'; label.textContent = 'TRÊS VIDAS / UMA NOVA CHANCE';
        paragraph(`${game.cargo} de 5 cargas entregues. ${game.score} pontos nesta partida. A próxima missão começa do zero.`);
        addButton('Tentar novamente', () => game.start(), true); addButton('Voltar ao menu', () => game.menu());
      }
      if (manageFocus) {
        if (playing) canvas.focus({ preventScroll: true });
        else { title.tabIndex = -1; title.focus({ preventScroll: true }); }
      }
      feedbackText = playing ? (previousState === 'paused' ? 'Missão retomada. ' : 'Missão iniciada. ') + missionHint()
        : ({ menu: 'Cinco cargas, três vidas. Escolha Jogar agora para iniciar.',
          instructions: 'O jogo não avança nas instruções. Use Voltar para sair desta tela.',
          paused: 'Partida pausada. Vidas, pontos e checkpoint estão preservados.',
          won: 'Missão concluída. Jogue novamente para tentar outro placar.',
          gameover: 'Fim de jogo. Escolha Tentar novamente para uma nova missão.' } as Partial<Record<State, string>>)[game.state]!;
      feedbackKind = game.state === 'won' ? 'victory' : 'hint'; feedbackUntil = game.elapsed + 3;
      previousState = game.state;
    }
    if (playing && game.checkpoint > previousCheckpoint) {
      feedbackText = `Checkpoint ativado: piso 0${game.checkpoint + 1}. Você retorna aqui se perder uma vida.`;
      feedbackKind = 'checkpoint'; feedbackUntil = game.elapsed + 3;
    }
    if (game.eventId !== previousEvent && game.lastEvent) {
      feedbackText = `${game.lastEvent.text}${game.lastEvent.points ? ` Mais ${game.lastEvent.points} pontos.` : ''}`;
      if (game.lastEvent.kind === 'damage' && game.lives > 0) {
        feedbackText += ` Retorno ao piso 0${game.checkpoint + 1}; proteção contra barris ao renascer.`;
      }
      if (game.lastEvent.kind === 'delivery' && game.cargo === 5) {
        feedbackText += ' Agora alcance a bandeira no piso 05.';
      }
      feedbackKind = game.lastEvent.kind; feedbackUntil = game.elapsed + 3;
      previousEvent = game.eventId;
    }
    previousCheckpoint = game.checkpoint;
    setText(live, playing && game.elapsed >= feedbackUntil ? missionHint() : feedbackText);
    const kind = playing && game.elapsed >= feedbackUntil ? 'hint' : feedbackKind;
    if (live.dataset.kind !== kind) live.dataset.kind = kind;
    return changed || force;
  }
  function shortcut(): void {
    if (game.state === 'instructions') act(() => game.closeInstructions());
    else if (game.state === 'playing') act(() => game.pause());
    else if (game.state === 'paused') act(() => game.resume());
  }
  controls = new BrowserControls(element('play-area'), input, () => game.state === 'playing', shortcut,
    () => { if (game.state === 'playing') act(() => game.pause()); });
  pause.addEventListener('click', shortcut);
  restart.addEventListener('click', () => act(() => game.start()));
  element('help').addEventListener('click', () => act(() => game.instructions()));
  const resize = (): void => {
    renderer.resize(sizeQuery.matches); dirty = true;
    setText(fields.camera, sizeQuery.matches ? `CÂMERA ACOMPANHA ${IDENTITY.CHARACTER_NAME_UPPER}` : 'CENÁRIO COMPLETO');
  };
  const motion = (): void => { reduced.checked = motionQuery.matches; renderer.reducedMotion = reduced.checked; dirty = true; };
  reduced.addEventListener('change', () => { renderer.reducedMotion = reduced.checked; dirty = true; });
  sizeQuery.addEventListener('change', resize); motionQuery.addEventListener('change', motion);
  resize(); motion(); sync(true, false);
  // Local QA can inspect copies but cannot mutate the running game through this API.
  if (new URLSearchParams(location.search).get('qa') === '1' && ['localhost', '127.0.0.1'].includes(location.hostname)) {
    Object.defineProperty(window, '__BARREL_QUEST__', { value: Object.freeze({ snapshot: () => game.snapshot() }), writable: false });
  }
  function frame(timestamp: number): void {
    const delta = lastTimestamp === null ? 0 : (timestamp - lastTimestamp) / 1000; lastTimestamp = timestamp;
    if (game.state === 'playing') clock.advance(delta, () => game.step(input.sample())); else clock.reset();
    const changed = sync();
    if (game.state === 'playing' || dirty || changed) { renderer.draw(game); dirty = false; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
try { boot(); } catch (error) { element('fatal').hidden = false; console.error(error); }
