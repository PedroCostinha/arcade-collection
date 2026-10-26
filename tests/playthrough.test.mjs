// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../dist/core/game.js';
import { pilot } from './pilot.mjs';

test('a full mission is winnable using ordinary inputs with live barrels and all scoring rules', () => {
  const game = new Game(); game.start();
  let hits = 0, lastLives = 3;
  for (let n = 0; n < 120 * 100 && game.state === 'playing'; n++) {
    game.step(pilot(game.snapshot()));
    if (game.lives !== lastLives) { hits++; lastLives = game.lives; }
  }
  assert.equal(game.state, 'won', JSON.stringify(game.snapshot()));
  assert.equal(game.cargo, 5); assert(game.lives > 0); assert(game.elapsed > 15 && game.elapsed < 100);
  assert(game.score >= 1750); assert.equal((game.score - 1750) % 100, 0);
  assert(hits < 3);
});
