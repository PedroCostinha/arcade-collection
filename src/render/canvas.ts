import { Game } from '../core/game.js';
import { DELIVERY_X, LADDERS, WORLD, floorY } from '../core/level.js';
import { clamp } from '../core/collision.js';
import { PALETTE, SPRITES } from './sprites.js';

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
  private label(value: string, x: number, y: number, color = '#9A8594', size = 11): void {
    this.ctx.font = `${size}px ui-monospace, Consolas, monospace`;
    this.ctx.fillStyle = color; this.ctx.fillText(value, x, y);
  }
  private robot(game: Game): void {
    const p = game.player;
    const frame = this.reducedMotion ? 0 : Math.floor(game.elapsed * 8);
    const pose = game.state === 'won' ? 'victory' : p.ladder !== null ? `climb${frame % 2}`
      : p.floor === null ? 'jump' : Math.abs(p.vx) > 120 ? `run${frame % 4}`
      : Math.abs(p.vx) > 10 ? `walk${frame % 2}` : 'idle';
    const grid = SPRITES[pose]!;
    const ctx = this.ctx;
    ctx.save(); ctx.translate(Math.round(p.x), Math.round(p.y)); ctx.scale(p.facing || 1, 1);
    for (let y = 0; y < grid.length; y++) {
      const row = grid[y]!;
      for (let x = 0; x < row.length; x++) {
        const color = PALETTE[row[x]!];
        if (color) this.rect(x * 2 - 16, y * 2 - 40, 2, 2, color);
      }
    }
    if (p.invulnerable > 0) { ctx.strokeStyle = '#EBC88D'; ctx.lineWidth = 1; ctx.strokeRect(-16, -42, 32, 44); }
    ctx.restore();
  }
  draw(game: Game): void {
    const ctx = this.ctx, { width, height } = this.canvas;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
    this.rect(0, 0, width, height, '#101015');
    // On a small display the camera follows, instead of shrinking Ember-7 to
    // a few pixels. The world and collision geometry stay identical.
    const cameraX = this.compact ? clamp(game.player.x - 240, 0, WORLD.width - width) : 0;
    const cameraY = this.compact ? clamp(game.player.y - 260, 0, WORLD.height - height) : 0;
    ctx.save(); ctx.translate(-Math.round(cameraX), -Math.round(cameraY));
    for (let x = 96; x < 920; x += 128) {
      this.rect(x, 140, 4, 438, '#211B25');
      ctx.strokeStyle = '#211B25'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, 180); ctx.lineTo(x + 120, 280); ctx.moveTo(x, 360); ctx.lineTo(x + 120, 460); ctx.stroke();
    }
    this.rect(56, 36, 848, 1, '#30232E');
    this.label('ESTACAO 01 / EMBER WORKS', 80, 25, '#B79AA9', 12);
    this.label('5 CARGAS. UM DESTINO.', 650, 25, '#A77385', 11);
    for (let floor = 0; floor < WORLD.floors; floor++) {
      const a = floorY(floor, WORLD.left), b = floorY(floor, WORLD.right);
      ctx.fillStyle = '#542330'; ctx.beginPath(); ctx.moveTo(WORLD.left, a); ctx.lineTo(WORLD.right, b);
      ctx.lineTo(WORLD.right, b + 10); ctx.lineTo(WORLD.left, a + 10); ctx.fill();
      ctx.strokeStyle = '#EC626E'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(WORLD.left, a); ctx.lineTo(WORLD.right, b); ctx.stroke();
      for (let x = 88; x < 880; x += 24) this.rect(x, floorY(floor, x) + 4, 8, 2, '#9A4153');
      this.label(`0${floor + 1}`, 47, a + 5, '#BC8D9F', 12);
      const terminalX = DELIVERY_X[floor]!, terminalY = floorY(floor, terminalX);
      this.rect(terminalX - 12, terminalY - 25, 24, 23, '#29222D');
      this.rect(terminalX - 8, terminalY - 21, 16, 9, game.deliveries[floor]!.collected ? '#EF777D' : '#643343');
      this.rect(terminalX - 5, terminalY - 8, 10, 2, '#9D7A8B');
      if (!game.deliveries[floor]!.collected) {
        this.rect(terminalX - 6, terminalY - 34, 12, 8, '#EBC88D');
        this.rect(terminalX - 3, terminalY - 32, 6, 4, '#714939');
      }
    }
    for (const ladder of LADDERS) {
      const top = floorY(ladder.to, ladder.x), bottom = floorY(ladder.from, ladder.x);
      // A visible hatch/grating indicates the only intentional pass-through.
      this.rect(ladder.x - 16, top - 3, 32, 15, '#101015');
      this.rect(ladder.x - 13, top - 4, 3, bottom - top + 4, '#B593A4');
      this.rect(ladder.x + 10, top - 4, 3, bottom - top + 4, '#B593A4');
      for (let y = top + 4; y < bottom; y += 10) this.rect(ladder.x - 10, y, 20, 2, '#A48192');
    }
    const goalY = floorY(4, 842);
    this.rect(835, goalY - 52, 5, 52, '#92919E');
    this.rect(840, goalY - 50, 28, 20, game.cargo === 5 ? '#F07880' : '#743343');
    this.rect(846, goalY - 45, 6, 6, '#E8DDE4');
    this.label('SAIDA', 810, goalY - 60, '#D7BDC9', 11);
    this.rect(858, floorY(4, 858) - 23, 35, 15, '#462533');
    this.rect(864, floorY(4, 858) - 20, 23, 6, '#B84D5E');
    for (const barrel of game.barrels) {
      ctx.save(); ctx.translate(Math.round(barrel.x), Math.round(barrel.y));
      if (!this.reducedMotion) ctx.rotate(barrel.angle);
      ctx.fillStyle = '#9B4352'; ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = Math.PI / 8 + i * Math.PI / 4;
        const x = 9 * Math.cos(angle), y = 9 * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill();
      this.rect(-7, -5, 14, 2, '#E89396'); this.rect(-7, 3, 14, 2, '#E89396'); this.rect(-2, -7, 2, 14, '#472330');
      ctx.restore();
    }
    this.robot(game);
    ctx.restore();
    this.rect(0, height - 3, width, 3, '#4E2737');
  }
}
