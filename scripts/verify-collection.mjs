// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const approved = JSON.parse(await readFile(new URL('../tests/fixtures/collection-1.2.0-manifest.json', import.meta.url), 'utf8'));
export const reviewFiles = ['REVIEW-ONLY.txt', 'collection/index.html', 'collection/collection.css', 'collection/portraits/ember7.png', 'collection/portraits/nib.png'];
export const menuFiles = reviewFiles.slice(1);
const publicMenu = JSON.parse(await readFile(new URL('../tests/fixtures/collection-1.3.0-menu-manifest.json', import.meta.url), 'utf8'));
if (publicMenu.version !== '1.3.0' || JSON.stringify(Object.keys(publicMenu.files).sort()) !== JSON.stringify([...menuFiles].sort())) throw new Error('Public menu manifest must fix all four 1.3.0 files');
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export async function inventory(directory, prefix = '') {
  const files = {};
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink is forbidden: ${prefix + entry.name}`);
    if (entry.isDirectory()) Object.assign(files, await inventory(path, prefix + entry.name + '/'));
    else if (entry.isFile()) files[prefix + entry.name] = sha256(await readFile(path));
    else throw new Error(`Unsupported artifact entry: ${path}`);
  }
  return files;
}
export async function verifyCollection(directory, { review = false } = {}) {
  const actual = await inventory(directory);
  const expected = [...Object.keys(approved.files), ...(review ? reviewFiles : menuFiles)].sort();
  if (JSON.stringify(Object.keys(actual).sort()) !== JSON.stringify(expected)) {
    const missing = expected.filter(file => !(file in actual));
    const extra = Object.keys(actual).filter(file => !expected.includes(file));
    throw new Error(`Artifact inventory differs; missing: ${missing.join(', ')}; extra: ${extra.join(', ')}`);
  }
  for (const [file, baseline] of Object.entries(approved.files)) {
    // Only recorded approved byte representations are accepted. Never refresh here.
    if (![baseline.sha256, baseline.lfSha256].includes(actual[file])) throw new Error(`Approved 1.2.0 file changed: ${file}`);
  }
  if (!review) {
    for (const [file, baseline] of Object.entries(publicMenu.files)) {
      if (![baseline.sha256, baseline.lfSha256].includes(actual[file])) throw new Error(`Public menu file changed: ${file}`);
    }
    for (const file of menuFiles.filter(file => /\.(html|css)$/.test(file))) {
      const content = await readFile(resolve(directory, file), 'utf8');
      if (/noindex|nofollow|review-only|review-badge|prévia local|estudo local|em revis[aã]o|prototype-dist/i.test(content)) throw new Error(`Review marker in production: ${file}`);
    }
  }
  return actual;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await verifyCollection(resolve(process.argv[2] ?? 'dist'), { review: process.argv.includes('--review') });
  console.log('Approved 1.2.0: all 28 files preserved; exact 1.3.0 production/review inventory verified.');
}
