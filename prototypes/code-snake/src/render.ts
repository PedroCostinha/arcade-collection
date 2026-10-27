// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import { HEIGHT, WIDTH, type SnakeGame } from './core.js';
import { colors, headSprite, palette } from './art.js';

export function draw(ctx: CanvasRenderingContext2D, game: SnakeGame, alpha: number) {
  const cell = 24;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = palette.background; ctx.fillRect(0, 0, WIDTH * cell, HEIGHT * cell);
  for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) {
    // Decorative contribution-calendar rhythm, without dates or contribution claims.
    ctx.fillStyle = (x * 11 + y * 7) % 13 < 3 ? palette.gridActive : palette.grid;
    ctx.fillRect(x * cell + 1, y * cell + 1, cell - 3, cell - 3);
  }
  if (game.item) {
    const x = game.item.x * cell, y = game.item.y * cell;
    ctx.fillStyle = '#4b3439'; ctx.fillRect(x + 6, y + 18, 12, 3);
    ctx.fillStyle = palette.core;
    for (let r = 0; r < 5; r++) { const w = r < 3 ? r + 1 : 5 - r; ctx.fillRect(x + 12 - w * 2, y + 5 + r * 2, w * 4, 2); }
    ctx.fillStyle = '#a65b61'; ctx.fillRect(x + 11, y + 8, 2, 4);
  }
  for (let i = game.body.length - 1; i >= 0; i--) {
    const p = game.body[i]!, prev = game.previous[i] ?? game.previous.at(-1) ?? p;
    const x = (prev.x + (p.x - prev.x) * alpha) * cell, y = (prev.y + (p.y - prev.y) * alpha) * cell;
    if (!i) {
      ctx.save(); ctx.translate(Math.round(x), Math.round(y));
      for (let row = 0; row < 12; row++) for (let col = 0; col < 12; col++) {
        const pixel = headSprite[row]![col]!;
        if (pixel !== '.') { ctx.fillStyle = colors[pixel]!; ctx.fillRect(col * 2, row * 2, 2, 2); }
      }
      ctx.restore();
    } else {
      ctx.fillStyle = i % 2 ? palette.plate : palette.body; ctx.fillRect(Math.round(x + 4), Math.round(y + 4), 16, 16);
      ctx.fillStyle = palette.light; ctx.fillRect(Math.round(x + 6), Math.round(y + 6), 9, 3);
      ctx.fillStyle = '#642b3b'; ctx.fillRect(Math.round(x + 6), Math.round(y + 17), 10, 3);
    }
  }
}
