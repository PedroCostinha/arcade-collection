// SPDX-License-Identifier: LicenseRef-Arcade-Art-Reserved
// Copyright (c) 2026 PedroCostinha. All rights reserved. See ART-RIGHTS.txt.
import type { LabelArt, RectArt } from '../render/art-types.js';

// Artistic composition only. No simulation, input handling or renderer algorithms.
export const SCENE = {
  background: '#101015', font: 'ui-monospace, Consolas, monospace',
  beams: {
    first: 96, end: 920, step: 128,
    column: [0, 140, 4, 438, '#211B25'] satisfies RectArt,
    stroke: '#211B25', lineWidth: 1,
    braces: [[0, 180, 120, 280], [0, 360, 120, 460]],
  },
  header: {
    rule: [56, 36, 848, 1, '#30232E'] satisfies RectArt,
    labels: [
      ['ESTACAO 01 / EMBER WORKS', 80, 25, '#B79AA9', 12],
      ['5 CARGAS. UM DESTINO.', 650, 25, '#A77385', 11],
    ] satisfies readonly LabelArt[],
  },
  floor: {
    fill: '#542330', depth: 10, stroke: '#EC626E', lineWidth: 3,
    rivets: { first: 88, end: 880, step: 24, rect: [0, 4, 8, 2, '#9A4153'] satisfies RectArt },
    label: { x: 47, dy: 5, color: '#BC8D9F', size: 12 },
  },
  terminal: {
    body: [-12, -25, 24, 23, '#29222D'] satisfies RectArt,
    screen: { x: -8, y: -21, width: 16, height: 9, collected: '#EF777D', pending: '#643343' },
    detail: [-5, -8, 10, 2, '#9D7A8B'] satisfies RectArt,
    cargo: [[-6, -34, 12, 8, '#EBC88D'], [-3, -32, 6, 4, '#714939']] satisfies readonly RectArt[],
  },
  ladder: {
    hatch: [-16, -3, 32, 15, '#101015'] satisfies RectArt,
    railOffsets: [-13, 10], topOffset: -4, railWidth: 3, extension: 4, color: '#B593A4',
    rungs: { start: 4, step: 10, rect: [-10, 0, 20, 2, '#A48192'] satisfies RectArt },
  },
  goal: {
    floor: 4, x: 842,
    pole: [835, -52, 5, 52, '#92919E'] satisfies RectArt,
    flag: { x: 840, y: -50, width: 28, height: 20, ready: '#F07880', pending: '#743343' },
    mark: [846, -45, 6, 6, '#E8DDE4'] satisfies RectArt,
    label: ['SAIDA', 810, -60, '#D7BDC9', 11] satisfies LabelArt,
    machineX: 858,
    machine: [[858, -23, 35, 15, '#462533'], [864, -20, 23, 6, '#B84D5E']] satisfies readonly RectArt[],
  },
  barrel: {
    fill: '#9B4352', sides: 8, angleOffsetDivisor: 8, angleStepDivisor: 4, radius: 9,
    details: [[-7, -5, 14, 2, '#E89396'], [-7, 3, 14, 2, '#E89396'], [-2, -7, 2, 14, '#472330']] satisfies readonly RectArt[],
  },
  robot: {
    framesPerSecond: 8, runThreshold: 120, walkThreshold: 10, pixelSize: 2, x: -16, y: -40,
    shield: { color: '#EBC88D', lineWidth: 1, rect: [-16, -42, 32, 44] },
  },
  bottom: { height: 3, color: '#4E2737' },
} as const;
