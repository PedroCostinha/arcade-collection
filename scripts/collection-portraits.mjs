// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
// Encodes existing pixel data without repainting it. Generated images retain
// LicenseRef-Arcade-Art-Reserved; see ART-RIGHTS.txt and code-snake/LICENSING.txt.
import { deflateSync } from 'node:zlib';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

function chunk(type, data) {
  const name = Buffer.from(type);
  let crc = 0xffffffff;
  for (const byte of Buffer.concat([name, data])) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  const result = Buffer.alloc(data.length + 12);
  result.writeUInt32BE(data.length); name.copy(result, 4); data.copy(result, 8);
  result.writeUInt32BE((crc ^ 0xffffffff) >>> 0, data.length + 8);
  return result;
}
export function pixelPng(rows, colors) {
  const width = rows[0].length, height = rows.length;
  const pixels = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    if (rows[y].length !== width) throw new Error('Inconsistent sprite width');
    for (let x = 0; x < width; x++) {
      const key = rows[y][x], color = colors[key];
      if (key === '.') continue;
      if (!/^#[0-9a-f]{6}$/i.test(color ?? '')) throw new Error(`Unknown sprite color: ${key}`);
      const offset = y * (1 + width * 4) + 1 + x * 4;
      pixels[offset] = parseInt(color.slice(1, 3), 16);
      pixels[offset + 1] = parseInt(color.slice(3, 5), 16);
      pixels[offset + 2] = parseInt(color.slice(5, 7), 16);
      pixels[offset + 3] = 255;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width); header.writeUInt32BE(height, 4);
  header[8] = 8; header[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
}
export async function buildPortraits(root, output) {
  const ember = await import(pathToFileURL(resolve(root, 'dist/art/ember7.js')).href);
  const nib = await import(pathToFileURL(resolve(root, 'dist/code-snake/modules/art.js')).href);
  await mkdir(output, { recursive: true });
  await writeFile(resolve(output, 'ember7.png'), pixelPng(ember.SPRITES.idle, ember.PALETTE));
  await writeFile(resolve(output, 'nib.png'), pixelPng(nib.headSprite, nib.colors));
}
