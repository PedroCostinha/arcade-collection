import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../dist/core/game.js';
import { floorY, LADDERS, FIXED_DT, PHYSICS, WORLD } from '../dist/core/level.js';
import { EMPTY_INPUT } from '../dist/core/types.js';
import { InputBuffer } from '../dist/core/input.js';
import { FixedClock } from '../dist/core/clock.js';
import { sweptBarrelHit } from '../dist/core/collision.js';
import { SPRITES } from '../dist/render/sprites.js';

const frame = (move = 0, climb = 0, jump = false) => ({ move, climb, jump });
function steps(game, count, input = EMPTY_INPUT) { for (let i = 0; i < count; i++) game.step(input); }
function ready() { const game = new Game(); game.start(); return game; }
function place(game, floor, x) {
  Object.assign(game.player, { x, y: floorY(floor, x), floor, lastFloor: floor, ladder: null, vx: 0, vy: 0 });
}

test('menu, instructions, pause and resume preserve or reset the right state', () => {
  const g = new Game(); assert.equal(g.state, 'menu');
  g.instructions(); assert.equal(g.state, 'instructions'); g.closeInstructions(); assert.equal(g.state, 'menu');
  g.start(); steps(g, 70, frame(1)); g.pause(); const snapshot = g.snapshot();
  steps(g, 1000, frame(1, -1, true)); assert.deepEqual(g.snapshot(), snapshot);
  g.instructions(); g.instructions(); g.closeInstructions(); assert.equal(g.state, 'paused');
  g.resume(); steps(g, 1); assert.equal(g.tick, 71);
});

test('five real slopes alternate and every ladder meets both floor surfaces', () => {
  for (let f = 0; f < 5; f++) {
    const slope = floorY(f, WORLD.right) - floorY(f, WORLD.left);
    assert.equal(slope, f % 2 === 0 ? -16 : 16);
  }
  assert.equal(LADDERS.length, 4);
  for (const l of LADDERS) assert(floorY(l.from, l.x) > floorY(l.to, l.x));
});

test('ground contact follows inclined platform in both directions', () => {
  for (const [floor, direction] of [[0, 1], [1, -1], [2, 1], [3, -1], [4, 1]]) {
    const g = ready(); place(g, floor, 400);
    steps(g, 90, frame(direction));
    assert.equal(g.player.floor, floor);
    assert.equal(g.player.y, floorY(floor, g.player.x));
    assert(Math.sign(g.player.x - 400) === direction);
  }
});

test('jump has gravity, a real apex, safe head collision and stable touchdown', () => {
  for (let floor = 0; floor < 5; floor++) {
    const g = ready(); place(g, floor, 460);
    const start = g.player.y;
    g.step(frame(0, 0, true)); assert(g.player.vy < 0); assert.equal(g.player.floor, null);
    let min = g.player.y;
    for (let i = 0; i < 110; i++) {
      g.step(EMPTY_INPUT); min = Math.min(min, g.player.y);
      if (floor < 4) assert(g.player.y - PHYSICS.bodyHeight >= floorY(floor + 1, g.player.x) + 9 - .001);
    }
    assert(start - min > 20); assert.equal(g.player.floor, floor); assert.equal(g.player.y, start);
  }
});

test('one held jump does not create an automatic second jump', () => {
  const input = new InputBuffer(), g = ready(); input.set('key', 'jump', true);
  for (let i = 0; i < 160; i++) g.step(input.sample());
  assert.equal(g.player.floor, 0); assert.equal(g.player.vy, 0);
});

test('ladder requires proximity, climbs up/down and stops when released', () => {
  const g = ready(), l = LADDERS[0];
  g.step(frame(0, -1)); assert.equal(g.player.ladder, null);
  place(g, 0, l.x); g.step(frame(0, -1)); assert.equal(g.player.ladder, 0);
  steps(g, 25, frame(0, -1)); const y = g.player.y;
  steps(g, 30); assert.equal(g.player.y, y);
  steps(g, 180, frame(0, -1)); assert.equal(g.player.floor, 1); assert.equal(g.player.ladder, null);
  steps(g, 180, frame(0, 1)); assert.equal(g.player.floor, 0);
});

test('jump detaches from a ladder, without teleporting horizontally', () => {
  const g = ready(); place(g, 0, 816); steps(g, 25, frame(0, -1));
  g.step(frame(-1, 0, true)); assert.equal(g.player.ladder, null); assert(g.player.vy < 0);
  assert(Math.abs(g.player.x - 816) < 1);
});

test('walking beyond a platform edge falls and loses exactly one life', () => {
  const g = ready(); place(g, 0, 82);
  for (let n = 0; n < 240 && g.lives === 3; n++) g.step(frame(-1));
  steps(g, 30);
  assert.equal(g.lives, 2); assert.equal(g.state, 'playing');
  assert(g.player.invulnerable > 0);
});

test('barrels spawn, follow downhill ramp, fall and reverse on next floor', () => {
  const g = ready(), b = g.spawnBarrel(); const firstX = b.x;
  steps(g, 20); assert(b.x < firstX); assert.equal(b.y + 9, floorY(4, b.x));
  steps(g, 1300); assert(b.floor <= 3 || b.floor === null);
  assert(g.barrels.some(barrel => barrel.id > b.id));
  assert(g.barrels.length < 30);
});

test('swept collision catches high-speed crossings and rejects a clear jump', () => {
  assert(sweptBarrelHit(-180, -9, 180, -9, 14, 40, 9));
  assert(sweptBarrelHit(0, -150, 0, 20, 14, 40, 9));
  assert(!sweptBarrelHit(-50, 35, 50, 35, 14, 40, 9));
  assert(!sweptBarrelHit(-50, -80, 50, -80, 14, 40, 9));
});

test('barrel collision removes a life, grants protection and clears nearby hazards', () => {
  const g = ready(); const b = g.spawnBarrel();
  Object.assign(b, { floor: 0, x: g.player.x, y: g.player.y - 9, previousX: g.player.x, previousY: g.player.y - 9 });
  g.step(EMPTY_INPUT); assert.equal(g.lives, 2); assert(g.player.invulnerable > 1.7);
  g.damage('barrel'); assert.equal(g.lives, 2); assert.equal(g.score, 0);
  assert.equal(g.barrels.length, 0);
});

test('three impacts end the game; pause and game over freeze the simulation', () => {
  const g = ready();
  for (let i = 0; i < 3; i++) { g.player.invulnerable = 0; g.damage('barrel'); }
  assert.equal(g.state, 'gameover'); assert.equal(g.lives, 0);
  const before = g.snapshot(); steps(g, 1000, frame(1, -1, true)); assert.deepEqual(g.snapshot(), before);
  g.start(); assert.equal(g.state, 'playing'); assert.equal(g.lives, 3); assert.equal(g.score, 0);
  assert.equal(g.cargo, 0); assert.equal(g.barrels.length, 0); assert.equal(g.elapsed, 0);
});

test('opening instructions from an end screen returns to a fresh menu', () => {
  const g = ready(); g.score = 750;
  for (let i = 0; i < 3; i++) { g.player.invulnerable = 0; g.damage('barrel'); }
  g.instructions(); g.closeInstructions();
  assert.equal(g.state, 'menu'); assert.equal(g.lives, 3); assert.equal(g.score, 0);
});

test('respawn returns to the last reached floor, preserving deliveries and score', () => {
  const g = ready(); place(g, 0, 760); g.step(EMPTY_INPUT);
  place(g, 0, 816); steps(g, 180, frame(0, -1)); assert.equal(g.checkpoint, 1);
  g.damage('barrel'); assert.equal(g.player.floor, 1); assert.equal(g.player.x, 816);
  assert.equal(g.cargo, 1); assert.equal(g.score, 250);
});

test('deliveries award 250 once; no score for time, walking or missing cargo', () => {
  const g = ready(); steps(g, 120); assert.equal(g.score, 0);
  place(g, 4, 850); g.step(EMPTY_INPUT); assert.equal(g.state, 'playing');
  for (const d of g.deliveries) { place(g, d.floor, d.x); g.step(EMPTY_INPUT); g.step(EMPTY_INPUT); }
  assert.equal(g.cargo, 5); assert.equal(g.score, 1250);
  place(g, 4, 845); g.step(EMPTY_INPUT); assert.equal(g.state, 'won'); assert.equal(g.score, 1750);
  const won = g.snapshot(); steps(g, 500); assert.deepEqual(g.snapshot(), won);
});

test('successful jump is credited after landing and once for a real barrel', () => {
  const g = ready(); place(g, 4, 460); const b = g.spawnBarrel();
  Object.assign(b, { x: 500, y: floorY(4, 500) - 9 });
  g.step(frame(1, 0, true)); steps(g, 70, frame(1));
  assert.equal(g.player.floor, 4); assert.equal(g.score, 100); assert(b.credited);
  steps(g, 30); assert.equal(g.score, 100);
});

test('barrels on lower floors cannot award a fake jump bonus', () => {
  const g = ready(); place(g, 4, 460); const b = g.spawnBarrel();
  Object.assign(b, { x: 465, floor: 1, y: floorY(1, 465) - 9 });
  g.step(frame(0, 0, true)); steps(g, 100); assert.equal(g.score, 0); assert(!b.credited);
});

test('input retains short taps, cancels opposing axes and releases sources independently', () => {
  const i = new InputBuffer(); i.set('key', 'right', true); i.set('touch', 'right', true);
  i.release('key'); assert.equal(i.sample().move, 1);
  i.set('left', 'left', true); assert.equal(i.sample().move, 0);
  i.set('tap', 'jump', true); i.release('tap'); assert.equal(i.sample().jump, true); assert.equal(i.sample().jump, false);
  i.clear(); assert.deepEqual(i.sample(), EMPTY_INPUT);
});

test('fixed clock gives the same result across 30/60/120Hz and caps tab stalls', () => {
  const results = [];
  for (const fps of [30, 60, 120]) {
    const clock = new FixedClock(), g = ready();
    for (let n = 0; n < fps; n++) clock.advance(1 / fps, () => g.step(frame(1)));
    results.push(g.snapshot());
  }
  assert.deepEqual(results[0], results[1]); assert.deepEqual(results[1], results[2]);
  const c = new FixedClock(); let calls = 0;
  assert.equal(c.advance(10000, () => calls++), 12); assert.equal(calls, 12);
  assert.equal(c.advance(NaN, () => calls++), 0); assert.equal(c.advance(-1, () => calls++), 0);
  c.reset(); assert.equal(c.advance(FIXED_DT, () => calls++), 1);
});

test('original robot has eleven poses with distinct walk/run/climb frames', () => {
  assert.equal(Object.keys(SPRITES).length, 11);
  for (const grid of Object.values(SPRITES)) { assert.equal(grid.length, 20); assert(grid.every(row => row.length === 16)); }
  for (const [prefix, count] of [['walk', 2], ['run', 4], ['climb', 2]])
    assert.equal(new Set(Array.from({ length: count }, (_, index) => SPRITES[`${prefix}${index}`].join(''))).size, count);
});

test('snapshot is a copy and cannot mutate gameplay', () => {
  const g = ready(); const s = g.snapshot(); s.player.x = -100; s.lives = 99;
  assert.equal(g.player.x, 136); assert.equal(g.lives, 3);
});

test('a head bump clamps to the underside instead of passing through a beam', () => {
  const g = ready();
  Object.assign(g.player, { x: 460, floor: null, y: floorY(1, 460) + 9 + PHYSICS.bodyHeight + 1, vy: -240, coyote: 0 });
  g.step(EMPTY_INPUT);
  assert.equal(g.player.vy, 0);
  assert.equal(g.player.y - PHYSICS.bodyHeight, floorY(1, 460) + 9);
});

test('a buffered jump just before landing triggers after ground contact', () => {
  const g = ready();
  Object.assign(g.player, { floor: null, y: floorY(0, g.player.x) - 1, vy: 200, coyote: 0 });
  g.step(frame(0, 0, true)); assert.equal(g.player.floor, 0);
  g.step(EMPTY_INPUT); assert.equal(g.player.floor, null); assert(g.player.vy < 0);
});

test('long varied input replays keep collision states and event scores finite', () => {
  const g = ready(); let seed = 71;
  for (let n = 0; n < 20000; n++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    if (g.state !== 'playing') g.start();
    g.step(frame((seed % 3) - 1, ((seed >>> 4) % 3) - 1, seed % 37 === 0));
    assert(Number.isFinite(g.player.x) && Number.isFinite(g.player.y));
    assert(g.lives >= 0 && g.lives <= 3); assert(g.score >= 0 && g.score % 50 === 0);
    if (g.player.floor !== null) assert.equal(g.player.y, floorY(g.player.floor, g.player.x));
    for (const b of g.barrels) assert(Number.isFinite(b.x) && Number.isFinite(b.y));
  }
});
