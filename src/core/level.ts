// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
export const WORLD = Object.freeze({ width: 960, height: 600, left: 80, right: 880, floors: 5 });
export const PHYSICS = Object.freeze({ speed: 170, gravity: 1000, jump: 285, climb: 104,
  halfWidth: 14, bodyHeight: 40, barrelRadius: 9, barrelSpeed: 84, spawnEvery: 3.1 });
export const FIXED_DT = 1 / 120;
export function floorY(floor: number, x: number): number {
  const u = (x - WORLD.left) / (WORLD.right - WORLD.left);
  // Unlike the authored SVG route, a live jump needs clearance for the full
  // 40px sprite + 41px jump + beam underside. Minimum separation is 90px.
  return 544 - floor * 106 + 16 * (floor % 2 === 0 ? 1 - u : u);
}
export const LADDERS = Object.freeze(Array.from({ length: 4 }, (_, from) => Object.freeze({
  id: from, from, to: from + 1, x: from % 2 === 0 ? 816 : 144
})));
export const DELIVERY_X = Object.freeze([760, 200, 760, 200, 760]);
export function spawnPoint(floor = 0): { x: number; y: number } {
  const x = floor === 0 ? 136 : LADDERS[floor - 1]!.x;
  return { x, y: floorY(floor, x) };
}
