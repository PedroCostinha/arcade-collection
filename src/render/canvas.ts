// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import { Game } from '../core/game.js';
import { DELIVERY_X, LADDERS, WORLD, floorY } from '../core/level.js';
import { clamp } from '../core/collision.js';
import { PALETTE, SPRITES } from './sprites.js';
import { SCENE as art } from '../art/scene.js';
import type { LabelArt, RectArt } from './art-types.js';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  reducedMotion = false;
  compact = false;
  constructor(readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Canvas 2D indisponível neste navegador.');
    this.ctx = context;
  }
  resize(compact: boolean): void {
    this.compact = compact;
    this.canvas.width = compact ? 480 : 960;
    this.canvas.height = compact ? 360 : 600;
    this.ctx.imageSmoothingEnabled = false;
  }
  private rect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  private rectAt(x: number, y: number, shape: RectArt): void {
    this.rect(x + shape[0], y + shape[1], shape[2], shape[3], shape[4]);
  }
  private label(shape: LabelArt, dy = 0): void {
    this.ctx.font = `${shape[4]}px ${art.font}`;
    this.ctx.fillStyle = shape[3]; this.ctx.fillText(shape[0], shape[1], shape[2] + dy);
  }
  private robot(game: Game): void {
    const p = game.player, style = art.robot;
    const frame = this.reducedMotion ? 0 : Math.floor(game.elapsed * style.framesPerSecond);
    const pose = game.state === 'won' ? 'victory' : p.ladder !== null ? `climb${frame % 2}`
      : p.floor === null ? 'jump' : Math.abs(p.vx) > style.runThreshold ? `run${frame % 4}`
      : Math.abs(p.vx) > style.walkThreshold ? `walk${frame % 2}` : 'idle';
    const grid = SPRITES[pose]!;
    const ctx = this.ctx;
    ctx.save(); ctx.translate(Math.round(p.x), Math.round(p.y)); ctx.scale(p.facing || 1, 1);
    for (let y = 0; y < grid.length; y++) {
      const row = grid[y]!;
      for (let x = 0; x < row.length; x++) {
        const color = PALETTE[row[x]!];
        if (color) this.rect(x * style.pixelSize + style.x, y * style.pixelSize + style.y, style.pixelSize, style.pixelSize, color);
      }
    }
    if (p.invulnerable > 0) { ctx.strokeStyle = style.shield.color; ctx.lineWidth = style.shield.lineWidth; ctx.strokeRect(...style.shield.rect); }
    ctx.restore();
  }
  draw(game: Game): void {
    const ctx = this.ctx, { width, height } = this.canvas;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
    this.rect(0, 0, width, height, art.background);
    // Camera and world geometry remain independent of the artistic data.
    const cameraX = this.compact ? clamp(game.player.x - 240, 0, WORLD.width - width) : 0;
    const cameraY = this.compact ? clamp(game.player.y - 260, 0, WORLD.height - height) : 0;
    ctx.save(); ctx.translate(-Math.round(cameraX), -Math.round(cameraY));
    for (let x = art.beams.first; x < art.beams.end; x += art.beams.step) {
      this.rectAt(x, 0, art.beams.column);
      ctx.strokeStyle = art.beams.stroke; ctx.lineWidth = art.beams.lineWidth;
      ctx.beginPath();
      for (const [x1, y1, x2, y2] of art.beams.braces) { ctx.moveTo(x + x1, y1); ctx.lineTo(x + x2, y2); }
      ctx.stroke();
    }
    this.rectAt(0, 0, art.header.rule);
    for (const label of art.header.labels) this.label(label);
    for (let floor = 0; floor < WORLD.floors; floor++) {
      const a = floorY(floor, WORLD.left), b = floorY(floor, WORLD.right), style = art.floor;
      ctx.fillStyle = style.fill; ctx.beginPath(); ctx.moveTo(WORLD.left, a); ctx.lineTo(WORLD.right, b);
      ctx.lineTo(WORLD.right, b + style.depth); ctx.lineTo(WORLD.left, a + style.depth); ctx.fill();
      ctx.strokeStyle = style.stroke; ctx.lineWidth = style.lineWidth;
      ctx.beginPath(); ctx.moveTo(WORLD.left, a); ctx.lineTo(WORLD.right, b); ctx.stroke();
      for (let x = style.rivets.first; x < style.rivets.end; x += style.rivets.step) this.rectAt(x, floorY(floor, x), style.rivets.rect);
      this.label([`0${floor + 1}`, style.label.x, a + style.label.dy, style.label.color, style.label.size]);
      const terminalX = DELIVERY_X[floor]!, terminalY = floorY(floor, terminalX), terminal = art.terminal;
      this.rectAt(terminalX, terminalY, terminal.body);
      this.rect(terminalX + terminal.screen.x, terminalY + terminal.screen.y, terminal.screen.width, terminal.screen.height,
        game.deliveries[floor]!.collected ? terminal.screen.collected : terminal.screen.pending);
      this.rectAt(terminalX, terminalY, terminal.detail);
      if (!game.deliveries[floor]!.collected) for (const shape of terminal.cargo) this.rectAt(terminalX, terminalY, shape);
    }
    for (const ladder of LADDERS) {
      const top = floorY(ladder.to, ladder.x), bottom = floorY(ladder.from, ladder.x), style = art.ladder;
      this.rectAt(ladder.x, top, style.hatch);
      for (const offset of style.railOffsets) this.rect(ladder.x + offset, top + style.topOffset, style.railWidth, bottom - top + style.extension, style.color);
      for (let y = top + style.rungs.start; y < bottom; y += style.rungs.step) this.rectAt(ladder.x, y, style.rungs.rect);
    }
    const goal = art.goal, goalY = floorY(goal.floor, goal.x);
    this.rectAt(0, goalY, goal.pole);
    this.rect(goal.flag.x, goalY + goal.flag.y, goal.flag.width, goal.flag.height, game.cargo === 5 ? goal.flag.ready : goal.flag.pending);
    this.rectAt(0, goalY, goal.mark);
    this.label(goal.label, goalY);
    for (const shape of goal.machine) this.rectAt(0, floorY(goal.floor, goal.machineX), shape);
    for (const barrel of game.barrels) {
      const style = art.barrel;
      ctx.save(); ctx.translate(Math.round(barrel.x), Math.round(barrel.y));
      if (!this.reducedMotion) ctx.rotate(barrel.angle);
      ctx.fillStyle = style.fill; ctx.beginPath();
      for (let i = 0; i < style.sides; i++) {
        const angle = Math.PI / style.angleOffsetDivisor + i * Math.PI / style.angleStepDivisor;
        const x = style.radius * Math.cos(angle), y = style.radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill();
      for (const shape of style.details) this.rectAt(0, 0, shape);
      ctx.restore();
    }
    this.robot(game);
    ctx.restore();
    this.rect(0, height - art.bottom.height, width, art.bottom.height, art.bottom.color);
  }
}
