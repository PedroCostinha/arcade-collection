export type State = 'menu' | 'instructions' | 'playing' | 'paused' | 'won' | 'gameover';
export type Axis = -1 | 0 | 1;
export interface FrameInput { move: Axis; climb: Axis; jump: boolean }
export const EMPTY_INPUT: Readonly<FrameInput> = Object.freeze({ move: 0, climb: 0, jump: false });
export interface Player {
  x: number; y: number; vx: number; vy: number;
  floor: number | null; lastFloor: number; ladder: number | null;
  facing: Axis; invulnerable: number; coyote: number; jumpBuffer: number;
}
export interface Barrel {
  id: number; x: number; y: number; previousX: number; previousY: number;
  direction: Axis; vy: number; floor: number | null; targetFloor: number;
  angle: number; credited: boolean;
}
export interface Delivery { floor: number; x: number; collected: boolean }
export interface GameEvent { kind: 'delivery' | 'jump' | 'damage' | 'victory'; text: string; points: number }
