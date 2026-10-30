// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { inflateSync } from 'node:zlib';
import { publicMenu } from '../../scripts/build-collection.mjs';
import { approved, verifyCollection, inventory } from '../../scripts/verify-collection.mjs';

function build() {
  const result = spawnSync(process.execPath, ['scripts/build-prototypes.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
}
test('fixed manifest identifies the approved commit, 28 files and original Git inputs', async () => {
  const historical = execFileSync('git', ['cat-file', 'blob', 'b1aacacb499319516b55adcc2f093630b0b888e6'], { encoding: 'utf8' });
  assert.equal((await readFile('tests/fixtures/collection-1.2.0-manifest.json', 'utf8')).replaceAll('\r\n', '\n'), historical, 'Historical manifest must remain immutable');
  for (const file of ['index.html', 'collection.css']) {
    const path = `prototypes/collection/${file}`;
    const reference = execFileSync('git', ['show', `f22f2069b2394cad8ff08638eb30a9e78e36f4ac:${path}`], { encoding: 'utf8' });
    assert.equal((await readFile(path, 'utf8')).replaceAll('\r\n', '\n'), reference, 'Approved menu source stays fixed');
  }
  assert.equal(approved.commit, '3599c4141f908f26ca5602fadd1e1a4c27a5f551');
  assert.equal(Object.keys(approved.files).length, 28);
  for (const input of approved.inputs) {
    assert.equal(execFileSync('git', ['rev-parse', `${approved.commit}:${input.path}`], { encoding: 'utf8' }).trim(), input.gitBlob);
    // The build orchestration is intentionally extended; game/build inputs stay fixed.
    if (input.path.startsWith('scripts/')) continue;
    const reference = execFileSync('git', ['cat-file', 'blob', input.gitBlob], { encoding: 'utf8' });
    if (input.path === 'package-lock.json') {
      const expected = JSON.parse(reference);
      expected.version = expected.packages[''].version = '1.3.0';
      assert.deepEqual(JSON.parse(await readFile(input.path, 'utf8')), expected, 'Only collection metadata may change; dependency graph stays fixed');
      continue;
    }
    assert.equal((await readFile(input.path, 'utf8')).replaceAll('\r\n', '\n'), reference, input.path);
  }
});
test('all 28 approved files survive in both builds, with exact same bytes', async () => {
  const production = await verifyCollection(resolve('dist'));
  const review = await verifyCollection(resolve('prototype-dist'), { review: true });
  for (const file of Object.keys(approved.files)) assert.equal(review[file], production[file], file);
});
test('guard rejects edits/deletions of all 32 public files and 28 historical review files, plus extras', async () => {
  const scratch = await mkdtemp(join(tmpdir(), 'arcade-integrity-'));
  try {
    for (const review of [false, true]) {
      const directory = join(scratch, review ? 'review' : 'production');
      await cp(resolve(review ? 'prototype-dist' : 'dist'), directory, { recursive: true });
      for (const file of Object.keys(await inventory(directory)).filter(file => !review || file in approved.files)) {
        const path = join(directory, file), bytes = await readFile(path);
        await writeFile(path, Buffer.concat([bytes, Buffer.from('tamper')]));
        await assert.rejects(verifyCollection(directory, { review }), /file changed/);
        await rm(path);
        await assert.rejects(verifyCollection(directory, { review }), /missing:/);
        await writeFile(path, bytes);
      }
      for (const extra of ['unexpected.txt', 'collection/rogue.js', 'code-snake/modules/extra.js']) {
        const path = join(directory, extra);
        await mkdir(resolve(path, '..'), { recursive: true });
        await writeFile(path, 'unapproved');
        await assert.rejects(verifyCollection(directory, { review }), /extra:/);
        await rm(path);
      }
    }
  } finally { await rm(scratch, { recursive: true, force: true }); }
});
test('production and review rebuilds are byte-reproducible and clean stale review files', async () => {
  const firstProduction = await inventory(resolve('dist'));
  const firstReview = await inventory(resolve('prototype-dist'));
  await writeFile('prototype-dist/collection/stale.js', 'stale');
  build();
  assert.deepEqual(await inventory(resolve('dist')), firstProduction);
  assert.deepEqual(await inventory(resolve('prototype-dist')), firstReview);
});
test('PNG portraits contain exactly the original sprite pixels and colors', async () => {
  const ember = await import('../../dist/art/ember7.js');
  const nib = await import('../../dist/code-snake/modules/art.js');
  for (const [file, rows, colors] of [['ember7', ember.SPRITES.idle, ember.PALETTE], ['nib', nib.headSprite, nib.colors]]) {
    const png = await readFile(`prototype-dist/collection/portraits/${file}.png`);
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(png.readUInt32BE(16), rows[0].length); assert.equal(png.readUInt32BE(20), rows.length);
    const data = [];
    for (let i = 8; i < png.length;) {
      const length = png.readUInt32BE(i);
      if (png.toString('ascii', i + 4, i + 8) === 'IDAT') data.push(png.subarray(i + 8, i + 8 + length));
      i += length + 12;
    }
    const pixels = inflateSync(Buffer.concat(data)), width = rows[0].length;
    for (let y = 0; y < rows.length; y++) {
      assert.equal(pixels[y * (width * 4 + 1)], 0);
      for (let x = 0; x < width; x++) {
        const key = rows[y][x], color = colors[key];
        const expected = key === '.' ? [0, 0, 0, 0] : [...Buffer.from(color.slice(1), 'hex'), 255];
        const offset = y * (width * 4 + 1) + 1 + x * 4;
        assert.deepEqual([...pixels.subarray(offset, offset + 4)], expected, `${file} ${x},${y}`);
      }
    }
  }
});
test('menu has independent CSS, native relative links and no JavaScript dependency', async () => {
  const html = await readFile('dist/collection/index.html', 'utf8');
  const review = await readFile('prototypes/collection/index.html', 'utf8');
  assert.equal(html, publicMenu(review));
  assert(!/noindex|nofollow|review|prévia local|estudo local|em revisão/i.test(html));
  assert.equal(await readFile('dist/collection/collection.css', 'utf8'), (await readFile('prototypes/collection/collection.css', 'utf8')).replaceAll('.review-badge', '.collection-badge'));
  for (const file of ['ember7.png', 'nib.png']) assert.deepEqual(await readFile(`dist/collection/portraits/${file}`), await readFile(`prototype-dist/collection/portraits/${file}`));
  assert.match(html, /href="collection.css"/);
  assert(!/<script|<canvas|style=|\.\.\/(?:theme|styles|code-snake\/style)\.css/i.test(html));
  assert.match(html, /href="\.\.\/"/); assert.match(html, /href="\.\.\/code-snake\/"/);
  assert.match(review, /noindex, nofollow/);
  const css = await readFile('dist/collection/collection.css', 'utf8');
  assert(!/@import|https?:\/\//i.test(css));
  assert.match(css, /prefers-reduced-motion/); assert.match(css, /:focus-visible/);
});
