import { clamp, approach, sweptBarrelHit } from './collision.js';
import { DELIVERY_X, FIXED_DT, LADDERS, PHYSICS as P, WORLD, floorY, spawnPoint } from './level.js';
import type { Barrel, Delivery, FrameInput, GameEvent, Player, State } from './types.js';

function playerAt(floor: number): Player {
  return { ...spawnPoint(floor), vx: 0, vy: 0, floor, lastFloor: floor, ladder: null,
    facing: 1, invulnerable: 0, coyote: .09, jumpBuffer: 0 };
}

export class Game {
  state: State = 'menu';
  player: Player = playerAt(0);
  barrels: Barrel[] = [];
  deliveries: Delivery[] = [];
  score = 0;
  lives = 3;
  elapsed = 0;
  tick = 0;
  checkpoint = 0;
  lastEvent: GameEvent | null = null;
  eventId = 0;
  private spawnTimer = 2.2;
  private nextBarrelId = 1;
  private pendingJumps = new Set<number>();
  private instructionsReturn: 'menu' | 'paused' = 'menu';

  constructor() { this.resetData(); }
  get cargo(): number { return this.deliveries.filter(delivery => delivery.collected).length; }
  private resetData(): void {
    this.player = playerAt(0); this.barrels = [];
    this.deliveries = DELIVERY_X.map((x, floor) => ({ x, floor, collected: false }));
    this.score = 0; this.lives = 3; this.elapsed = 0; this.tick = 0; this.checkpoint = 0;
    this.spawnTimer = 2.2; this.nextBarrelId = 1; this.pendingJumps.clear(); this.lastEvent = null;
  }
  start(): void { this.resetData(); this.state = 'playing'; }
  menu(): void { this.resetData(); this.state = 'menu'; }
  pause(): void { if (this.state === 'playing') this.state = 'paused'; }
  resume(): void { if (this.state === 'paused') this.state = 'playing'; }
  instructions(): void {
    if (this.state === 'instructions') return;
    this.instructionsReturn = this.state === 'playing' || this.state === 'paused' ? 'paused' : 'menu';
    this.state = 'instructions';
  }
  closeInstructions(): void {
    if (this.state !== 'instructions') return;
    if (this.instructionsReturn === 'menu') this.menu(); else this.state = 'paused';
  }

  private emit(kind: GameEvent['kind'], text: string, points = 0): void {
    this.score += points; this.eventId++; this.lastEvent = { kind, text, points };
  }
  damage(reason: 'barrel' | 'fall'): void {
    if (this.state !== 'playing' || (reason === 'barrel' && this.player.invulnerable > 0)) return;
    this.lives--; this.pendingJumps.clear();
    this.emit('damage', reason === 'fall' ? 'Queda. Uma vida perdida.' : 'Impacto com barril. Uma vida perdida.');
    if (this.lives === 0) { this.state = 'gameover'; return; }
    this.player = playerAt(this.checkpoint); this.player.invulnerable = 1.8;
    // A respawn gets a clear local space, rather than a chain of unavoidable hits.
    this.barrels = this.barrels.filter(b => Math.hypot(b.x - this.player.x, b.y - this.player.y) > 90);
  }

  private land(floor: number): void {
    const p = this.player;
    p.floor = floor; p.lastFloor = floor; p.ladder = null; p.vy = 0; p.y = floorY(floor, p.x);
    this.checkpoint = Math.max(this.checkpoint, floor);
    if (this.pendingJumps.size) {
      this.emit('jump', 'Salto seguro concluído.', this.pendingJumps.size * 100);
      this.pendingJumps.clear();
    }
  }

  private movePlayer(input: FrameInput): void {
    const p = this.player, dt = FIXED_DT;
    p.jumpBuffer = input.jump ? .12 : Math.max(0, p.jumpBuffer - dt);
    p.coyote = p.floor !== null ? .09 : Math.max(0, p.coyote - dt);
    if (p.ladder === null && input.climb !== 0 && p.floor !== null) {
      const ladder = LADDERS.find(l => Math.abs(p.x - l.x) <= 18
        && ((input.climb < 0 && p.floor === l.from) || (input.climb > 0 && p.floor === l.to)));
      if (ladder) { p.ladder = ladder.id; p.floor = null; p.x = ladder.x; p.vx = 0; p.vy = 0; }
    }
    if (p.ladder !== null) {
      const ladder = LADDERS[p.ladder]!;
      p.x = ladder.x; p.vx = 0;
      if (p.jumpBuffer > 0) {
        p.ladder = null; p.vy = -P.jump; p.jumpBuffer = 0; p.coyote = 0;
      } else {
        p.y += input.climb * P.climb * dt;
        if (p.y <= floorY(ladder.to, p.x)) this.land(ladder.to);
        else if (p.y >= floorY(ladder.from, p.x)) this.land(ladder.from);
        return;
      }
    }
    const previousX = p.x, previousY = p.y;
    p.vx = approach(p.vx, input.move * P.speed, (p.floor !== null ? 1400 : 1000) * dt);
    if (input.move) p.facing = input.move;
    p.x = clamp(p.x + p.vx * dt, 38, WORLD.width - 38);
    if (p.floor !== null) {
      p.y = floorY(p.floor, clamp(p.x, WORLD.left, WORLD.right));
      if (p.x < WORLD.left || p.x > WORLD.right) p.floor = null;
    }
    if (p.jumpBuffer > 0 && p.coyote > 0) {
      p.vy = -P.jump; p.floor = null; p.coyote = 0; p.jumpBuffer = 0;
    }
    if (p.floor !== null) return;
    p.vy = Math.min(440, p.vy + P.gravity * dt);
    const nextY = p.y + p.vy * dt;
    if (p.x >= WORLD.left && p.x <= WORLD.right) {
      for (let floor = 4; floor >= 0; floor--) {
        const before = floorY(floor, previousX), surface = floorY(floor, p.x);
        if (p.vy >= 0 && previousY <= before + .2 && nextY >= surface) { this.land(floor); return; }
        const bottom = surface + 9;
        if (p.vy < 0 && previousY - P.bodyHeight >= before + 9 - .2
          && nextY - P.bodyHeight <= bottom) { p.y = bottom + P.bodyHeight; p.vy = 0; return; }
      }
    }
    p.y = nextY;
  }

  spawnBarrel(): Barrel {
    const x = 852;
    const barrel: Barrel = { id: this.nextBarrelId++, x, y: floorY(4, x) - P.barrelRadius,
      previousX: x, previousY: floorY(4, x) - P.barrelRadius, direction: -1, vy: 0,
      floor: 4, targetFloor: 3, angle: 0, credited: false };
    this.barrels.push(barrel);
    return barrel;
  }
  private moveBarrels(): void {
    for (const b of this.barrels) {
      b.previousX = b.x; b.previousY = b.y;
      b.x += b.direction * P.barrelSpeed * FIXED_DT;
      b.angle += b.direction * P.barrelSpeed * FIXED_DT / P.barrelRadius;
      if (b.floor !== null) {
        b.y = floorY(b.floor, b.x) - P.barrelRadius;
        if (b.x < WORLD.left - 9 || b.x > WORLD.right + 9) {
          b.targetFloor = b.floor - 1; b.floor = null; b.direction = b.direction === 1 ? -1 : 1; b.vy = 0;
        }
      } else {
        b.vy = Math.min(440, b.vy + P.gravity * FIXED_DT); b.y += b.vy * FIXED_DT;
        if (b.targetFloor >= 0 && b.x >= WORLD.left && b.x <= WORLD.right
          && b.y + P.barrelRadius >= floorY(b.targetFloor, b.x)) {
          b.floor = b.targetFloor; b.y = floorY(b.floor, b.x) - P.barrelRadius; b.vy = 0;
        }
      }
    }
    this.barrels = this.barrels.filter(b => b.y < WORLD.height + 50 && b.x > 10 && b.x < WORLD.width - 10);
  }

  step(input: FrameInput): void {
    if (this.state !== 'playing') return;
    this.tick++; this.elapsed += FIXED_DT;
    this.player.invulnerable = Math.max(0, this.player.invulnerable - FIXED_DT);
    const previous = { x: this.player.x, y: this.player.y };
    this.movePlayer(input);
    if (this.player.y > WORLD.height + 60) { this.damage('fall'); return; }
    this.spawnTimer -= FIXED_DT;
    if (this.spawnTimer <= 0) { this.spawnBarrel(); this.spawnTimer += P.spawnEvery; }
    this.moveBarrels();
    const p = this.player;
    for (const b of this.barrels) {
      if (p.invulnerable <= 0 && sweptBarrelHit(b.previousX - previous.x, b.previousY - previous.y,
        b.x - p.x, b.y - p.y, P.halfWidth, P.bodyHeight, P.barrelRadius)) { this.damage('barrel'); return; }
      const crossed = (b.previousX - previous.x) * (b.x - p.x) <= 0;
      if (!b.credited && p.floor === null && p.ladder === null && crossed
        && p.y < b.y - P.barrelRadius - 2 && p.y > b.y - 60) {
        b.credited = true; this.pendingJumps.add(b.id);
      }
    }
    for (const delivery of this.deliveries) {
      const y = floorY(delivery.floor, delivery.x) - 24;
      if (!delivery.collected && Math.abs(p.x - delivery.x) < 22 && p.y >= y - 5 && p.y - P.bodyHeight <= y + 5) {
        delivery.collected = true; this.emit('delivery', `Carga ${this.cargo} de 5 entregue.`, 250);
      }
    }
    if (p.floor === 4 && p.x >= 842 && this.cargo === 5) {
      this.emit('victory', 'Missão concluída. As cinco cargas chegaram ao destino.', 500); this.state = 'won';
    }
  }
  /** Read-only diagnostic copy for local QA. No state-changing browser hook. */
  snapshot(): object {
    return structuredClone({ state: this.state, player: this.player, barrels: this.barrels,
      cargo: this.cargo, score: this.score, lives: this.lives, elapsed: this.elapsed, checkpoint: this.checkpoint });
  }
}
