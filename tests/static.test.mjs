// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { serve } from '../scripts/serve.mjs';

const root = resolve('dist');
async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    assert(!entry.isSymbolicLink(), 'No symlinks in the published artifact');
    if (entry.isDirectory()) result.push(...await files(path));
    else result.push(relative(root, path).split(sep).join('/'));
  }
  return result;
}

test('static artifact contains only current modules and public assets', async () => {
  const built = (await files(root)).filter(file => !file.startsWith('code-snake/') && !file.startsWith('collection/')).sort();
  const modules = [];
  async function source(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await source(path);
      else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) modules.push(relative(resolve('src'), path).split(sep).join('/').replace(/\.ts$/, '.js'));
    }
  }
  await source(resolve('src'));
  assert.deepEqual(built, [...modules, '.nojekyll', 'index.html', 'styles.css', 'theme.css', 'favicon.svg', 'LICENSE-CODE.txt', 'ART-RIGHTS.txt', 'LICENSING.txt'].sort());
  for (const file of built) assert((await stat(resolve(root, file))).size > 0 || file === '.nojekyll');
});

test('project subpath serves the entire relative ES module graph and assets', async () => {
  const server = await serve({ port: 0 });
  const base = `http://127.0.0.1:${server.address().port}/arcade-collection/`;
  try {
    const html = await fetch(base);
    assert.equal(html.status, 200);
    const markup = await html.text();
    assert(!markup.includes('{{'), 'Identity placeholders must be resolved at build time');
    assert(!/em revis[aã]o/i.test(markup));
    assert(markup.includes('V1.1.0'));
    const queue = [...markup.matchAll(/(?:src|href)="([^"#][^"]*)"/g)].map(match => new URL(match[1], base).href);
    const seen = new Set();
    while (queue.length) {
      const url = queue.shift();
      if (seen.has(url)) continue;
      seen.add(url);
      assert(url.startsWith(base), `Asset must stay under project path: ${url}`);
      const response = await fetch(url);
      assert.equal(response.status, 200, url);
      if (url.endsWith('.js')) {
        assert.match(response.headers.get('content-type'), /javascript/);
        const js = await response.text();
        for (const match of js.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) queue.push(new URL(match[1], url).href);
      }
    }
    assert(seen.size >= 10, 'Traverse the game modules as well as HTML assets');
    assert.equal((await fetch(new URL('missing.js', base))).status, 404, 'No SPA fallback hides a missing module');
    assert.equal((await fetch(new URL('.nojekyll', base))).status, 200);
    for (const file of ['styles.css', 'theme.css']) {
      const css = await readFile(resolve(root, file), 'utf8');
      assert(!/@import|https?:\/\//i.test(css), 'Styles must not load remote runtime resources');
    }
    for (const [source, emitted] of [['LICENSE-CODE.txt', 'LICENSE-CODE.txt'], ['ART-RIGHTS.txt', 'ART-RIGHTS.txt'], ['LICENSING.md', 'LICENSING.txt']]) {
      assert.equal(await readFile(resolve(root, emitted), 'utf8'), await readFile(source, 'utf8'), 'License notices must ship intact');
      assert.match((await fetch(new URL(emitted, base))).headers.get('content-type'), /text\/plain/);
    }
  } finally {
    server.closeAllConnections();
    await new Promise(ok => server.close(ok));
  }
});

test('distributed license scopes distinguish reserved art from MIT code', async () => {
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
  assert.equal(pkg.version, '1.3.0', 'Collection version; Barrel UI remains 1.1.0');
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[''].version, pkg.version);
  assert.equal(pkg.license, 'SEE LICENSE IN LICENSING.md');
  assert.equal(lock.packages[''].license, pkg.license);
  assert.equal(pkg.private, true);
  for (const file of ['art/ember7.js', 'art/scene.js', 'art/identity.js', 'theme.css', 'favicon.svg']) {
    const content = await readFile(resolve(root, file), 'utf8');
    assert.match(content, /SPDX-License-Identifier: LicenseRef-Arcade-Art-Reserved/, file);
    assert(!content.includes('SPDX-License-Identifier: MIT'), file);
  }
  for (const file of ['render/canvas.js', 'render/sprites.js', 'app.js', 'styles.css', 'index.html']) {
    assert.match(await readFile(resolve(root, file), 'utf8'), /SPDX-License-Identifier: MIT/, file);
  }
  const adapter = await readFile(resolve(root, 'render/sprites.js'), 'utf8');
  assert.match(adapter, /from ['"]\.\.\/art\/ember7\.js['"]/);
  assert(!adapter.includes('"idle"'), 'MIT adapter must not contain sprite pixels');
});
