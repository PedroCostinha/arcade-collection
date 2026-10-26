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
      label.textContent = 'MISSÃO 01 / EMBER-7';
      if (game.state === 'menu') {
        title.textContent = 'ENTREGA\nEM NÍVEL MÁXIMO.';
        paragraph('Barris em movimento. Cinco cargas esperando. Você no controle de Ember-7.');
        addButton('Jogar agora', () => game.start(), true); addButton('Como jogar', () => game.instructions());
      } else if (game.state === 'instructions') {
        title.textContent = 'COMO JOGAR'; label.textContent = 'CONTROLES / OBJETIVO';
        const list = document.createElement('ul');
        for (const text of ['Setas ou A/D: andar. W/S ou setas verticais: subir/descer junto à escada.',
          'Espaço: pular. P ou Esc: pausar e continuar.', 'No celular: segure as setas e toque em PULAR. É possível mover e pular ao mesmo tempo.',
          'Recolha as cinco cargas douradas. Chegue à bandeira do último andar para vencer.',
          'Barris e quedas custam uma vida. Você tem três; o retorno usa o último piso alcançado.']) {
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
      previousState = game.state;
      live.textContent = playing ? 'Missão iniciada ou retomada.' : title.textContent;
    }
    if (game.eventId !== previousEvent && game.lastEvent) {
      live.textContent = `${game.lastEvent.text}${game.lastEvent.points ? ` Mais ${game.lastEvent.points} pontos.` : ''}`;
      previousEvent = game.eventId;
    }
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
    setText(fields.camera, sizeQuery.matches ? 'CÂMERA ACOMPANHA EMBER-7' : 'CENÁRIO COMPLETO');
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
