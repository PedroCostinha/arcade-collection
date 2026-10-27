// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
export type Point = { x: number; y: number };
export type Direction = 'up' | 'down' | 'left' | 'right';
export type Status = 'menu' | 'playing' | 'paused' | 'over' | 'won';
export const WIDTH = 24, HEIGHT = 16, TICK = 150;
export const vectors: Record<Direction, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
export const equal = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
const opposite = (a: Direction, b: Direction) => vectors[a].x + vectors[b].x === 0 && vectors[a].y + vectors[b].y === 0;

export class SnakeGame {
  status: Status = 'menu';
  body: Point[] = [];
  previous: Point[] = [];
  direction: Direction = 'right';
  queue: Direction[] = [];
  item: Point | null = null;
  score = 0;
  constructor(private readonly random: () => number = Math.random) { this.reset(); this.status = 'menu'; }
  reset() {
    this.body = [{ x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }];
    this.previous = this.body.map(p => ({ ...p }));
    this.direction = 'right'; this.queue = []; this.score = 0; this.status = 'playing';
    // First item is authored for discoverability; subsequent items use free-cell RNG.
    this.item = { x: 9, y: 8 };
  }
  turn(direction: Direction) {
    if (this.status !== 'playing' || this.queue.length >= 2) return;
    const last = this.queue.at(-1) ?? this.direction;
    if (last !== direction && !opposite(last, direction)) this.queue.push(direction);
  }
  pause() { if (this.status === 'playing') { this.status = 'paused'; this.queue = []; this.previous = this.body.map(p => ({ ...p })); } }
  resume() { if (this.status === 'paused') this.status = 'playing'; }
  spawn() {
    const free: Point[] = [];
    for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) if (!this.body.some(p => equal(p, { x, y }))) free.push({ x, y });
    if (!free.length) { this.item = null; this.status = 'won'; return; }
    const sample = this.random();
    if (!Number.isFinite(sample) || sample < 0 || sample >= 1) throw new Error('RNG must return a value in [0,1)');
    this.item = free[Math.floor(sample * free.length)]!;
  }
  step() {
    if (this.status !== 'playing') return;
    const direction = this.queue.shift() ?? this.direction;
    const head = this.body[0]!, vector = vectors[direction];
    const next = { x: head.x + vector.x, y: head.y + vector.y };
    const eat = this.item !== null && equal(next, this.item);
    // Moving into the cell vacated by the tail is legal unless growing.
    const occupied = eat ? this.body : this.body.slice(0, -1);
    if (next.x < 0 || next.y < 0 || next.x >= WIDTH || next.y >= HEIGHT || occupied.some(p => equal(p, next))) {
      this.status = 'over'; this.queue = []; return;
    }
    this.previous = this.body.map(p => ({ ...p })); this.direction = direction;
    this.body.unshift(next);
    if (eat) { this.score += 10; this.spawn(); }
    else this.body.pop();
  }
}
