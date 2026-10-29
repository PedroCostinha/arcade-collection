// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildPortraits } from './collection-portraits.mjs';

// Keep the approved review source intact. Only review indicators change in public output.
export function publicMenu(html) {
  for (const [before, after] of [
    ['  <meta name="robots" content="noindex, nofollow">', ''],
    ['Arcade Collection · Estudo local', 'Arcade Collection'],
    ['review-badge', 'collection-badge'],
    ['PRÉVIA LOCAL', 'COLEÇÃO 1.3.0'],
    ['Estudo local <span>· Menu 1.3.0 em revisão</span>', 'ARCADE COLLECTION <span>· 1.3.0</span>'],
  ]) {
    if (html.split(before).length !== 2) throw new Error(`Unexpected approved menu marker: ${before}`);
    html = html.replace(before, after);
  }
  return html;
}
export async function buildCollection(root) {
  const output = resolve(root, 'dist/collection');
  await mkdir(output, { recursive: true });
  await writeFile(resolve(output, 'index.html'), publicMenu(await readFile(resolve(root, 'prototypes/collection/index.html'), 'utf8')));
  const css = await readFile(resolve(root, 'prototypes/collection/collection.css'), 'utf8');
  // Rename only the former review indicator's selector; every visual rule is preserved.
  await writeFile(resolve(output, 'collection.css'), css.replaceAll('.review-badge', '.collection-badge'));
  await buildPortraits(root, resolve(output, 'portraits'));
}
