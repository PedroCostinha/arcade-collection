// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { CanvasRenderer } from '../dist/render/canvas.js';
import { Game } from '../dist/core/game.js';
import { PALETTE, SPRITES } from '../dist/render/sprites.js';

test('art extraction preserves every Canvas command from the approved RC in 32 render scenarios', async () => {
  // Captured before extraction from 629322d; do not regenerate to accept a visual change.
  const baseline = JSON.parse(await readFile(new URL('./fixtures/render-rc-baseline.json', import.meta.url), 'utf8'));
  assert.equal(baseline.length, 32);
  const pixelsHash = createHash('sha256').update(JSON.stringify({ PALETTE, SPRITES })).digest('hex');
  assert.equal(pixelsHash, (await readFile(new URL('./fixtures/sprites-rc.sha256', import.meta.url), 'utf8')).trim(), 'All eleven poses and the palette must remain byte-equivalent');
  for (const expected of baseline) {
    const { compact, reduced, pose } = expected, calls = [];
    const ctx = new Proxy({}, {
      set(target, key, value) { calls.push(['set', key, value]); target[key] = value; return true; },
      get(target, key) { return target[key] ?? ((...args) => calls.push([key, ...args])); },
    });
    const canvas = { width: 960, height: 600, getContext: () => ctx };
    const renderer = new CanvasRenderer(canvas); renderer.resize(compact); renderer.reducedMotion = reduced;
    const game = new Game(); game.start(); game.elapsed = 3.75;
    game.player.x = 490; game.player.y = 330; game.player.facing = -1;
    if (pose === 'walk') game.player.vx = 50;
    if (pose === 'run') game.player.vx = 180;
    if (pose === 'jump') game.player.floor = null;
    if (pose === 'climb') game.player.ladder = 1;
    if (pose === 'protected') game.player.invulnerable = 1;
    if (pose === 'victory') { game.state = 'won'; for (const delivery of game.deliveries) delivery.collected = true; }
    if (pose === 'gameover') game.state = 'gameover';
    game.deliveries[0].collected = true;
    game.spawnBarrel().angle = .75;
    renderer.draw(game);
    const actual = { compact, reduced, pose, commands: calls.length, sha256: createHash('sha256').update(JSON.stringify(calls)).digest('hex') };
    assert.deepEqual(actual, expected, `Visual regression: ${JSON.stringify({ compact, reduced, pose })}`);
  }
});
