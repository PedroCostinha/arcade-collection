// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { menuFiles } from '../../scripts/verify-collection.mjs';
import { serve } from '../../scripts/serve.mjs';

const baseline = JSON.parse(await readFile(new URL('../fixtures/barrel-1.1.0-manifest.json', import.meta.url), 'utf8'));
const snakeFiles = ['index.html', 'style.css', 'LICENSING.txt', 'modules/app.js', 'modules/art.js', 'modules/core.js', 'modules/render.js'];
const allowlist = [...Object.keys(baseline.files), ...snakeFiles.map(file => 'code-snake/' + file), ...menuFiles].sort();
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const canonicalHash = bytes => hash(bytes.toString('utf8').replaceAll('\r\n', '\n'));
async function manifest(dir = resolve('dist'), prefix = '') {
  const entries = {};
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), 'No symlinks in a deployable artifact');
    if (entry.isDirectory()) Object.assign(entries, await manifest(resolve(dir, entry.name), prefix + entry.name + '/'));
    else entries[prefix + entry.name] = hash(await readFile(resolve(dir, entry.name)));
  }
  return entries;
}
function build(script = 'scripts/build.mjs') {
  const result = spawnSync(process.execPath, [script], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
}

test('all 21 Barrel Quest 1.1.0 files retain their approved content', async () => {
  assert.equal(Object.keys(baseline.files).length, 21);
  assert.equal(baseline.commit, 'ffc56b1b312bf91889999902398ebe2fa9b74bee');
  for (const [file, expected] of Object.entries(baseline.files)) {
    assert.equal(canonicalHash(await readFile(resolve('dist', file))), expected, `Stable Barrel file changed: ${file}`);
  }
});

test('production allowlist is exactly 32 files; no review material, sources or internal material', async () => {
  assert.deepEqual(Object.keys(await manifest()).sort(), allowlist);
  for (const file of allowlist) assert(!/prototype|evidence|test|\.ts$|\.map$|node_modules|REVIEW-ONLY/i.test(file), file);
});

test('Snake model, input, rendering, art and theme remain identical to the approved prototype', async () => {
  const approved = JSON.parse(await readFile(new URL('../fixtures/code-snake-approved-manifest.json', import.meta.url), 'utf8'));
  for (const [file, expected] of Object.entries(approved.files)) {
    assert.equal(canonicalHash(await readFile(resolve('games/code-snake', file))), expected, file);
  }
});

test('all three production routes load their complete graph and legal notices at root and project subpath', async () => {
  const server = await serve({ port: 0 });
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const prefix of ['/', '/arcade-collection/']) {
      const base = origin + prefix;
      const queue = [base, base + 'code-snake/', base + 'collection/', ...['LICENSE-CODE.txt', 'ART-RIGHTS.txt', 'LICENSING.txt'].map(file => base + file)];
      const seen = new Set();
      while (queue.length) {
        const url = queue.shift();
        if (seen.has(url)) continue;
        seen.add(url);
        assert(url.startsWith(base), `Unexpected external or out-of-subpath request: ${url}`);
        const response = await fetch(url);
        assert.equal(response.status, 200, url);
        assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
        const type = response.headers.get('content-type'), content = await response.text();
        if (url.endsWith('/')) {
          assert.match(type, /text\/html/);
          assert(!/protótipo|noindex|href="[^"\n]*collection\//i.test(content));
          for (const match of content.matchAll(/(?:src|href)="([^"#][^"]*)"/g)) queue.push(new URL(match[1], url).href);
        } else if (url.endsWith('.js')) {
          assert.match(type, /javascript/);
          for (const match of content.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) queue.push(new URL(match[1], url).href);
        } else if (url.endsWith('.css')) {
          assert.match(type, /text\/css/);
          assert(!/@import|https?:\/\/|url\s*\(/i.test(content), 'No hidden runtime CSS dependency');
        } else if (url.endsWith('.txt')) assert.match(type, /text\/plain/);
      }
      for (const file of snakeFiles) assert(seen.has(base + 'code-snake/' + (file === 'index.html' ? '' : file)), `Snake file not reachable: ${file}`);
      for (const file of ['LICENSE-CODE.txt', 'ART-RIGHTS.txt', 'LICENSING.txt']) assert(seen.has(base + file));
      for (const forbidden of ['prototype-dist/', 'games/code-snake/src/core.ts', 'code-snake/src/core.ts', 'code-snake/tests/browser.mjs', 'docs/', 'REVIEW-ONLY.txt']) {
        assert.equal((await fetch(base + forbidden)).status, 404, forbidden);
      }
    }
  } finally { server.closeAllConnections(); await new Promise(ok => server.close(ok)); }
});

test('distribution preserves MIT code scopes and reserved Nib/theme scopes with accessible full terms', async () => {
  const legal = await readFile('dist/code-snake/LICENSING.txt', 'utf8');
  assert.equal(legal, await readFile('games/code-snake/LICENSING.md', 'utf8'));
  assert.match(legal, /Nib[\s\S]*LicenseRef-Arcade-Art-Reserved/);
  assert.match(legal, /\.\.\/LICENSE-CODE\.txt/);
  assert.match(await readFile('dist/LICENSE-CODE.txt', 'utf8'), /MIT License/);
  for (const file of ['modules/app.js', 'modules/core.js', 'modules/render.js', 'index.html']) {
    assert.match(await readFile('dist/code-snake/' + file, 'utf8'), /SPDX-License-Identifier: MIT/);
  }
  for (const file of ['modules/art.js', 'style.css']) {
    const content = await readFile('dist/code-snake/' + file, 'utf8');
    assert.match(content, /SPDX-License-Identifier: LicenseRef-Arcade-Art-Reserved/);
    assert(!content.includes('SPDX-License-Identifier: MIT'));
  }
  assert.match(await readFile('dist/code-snake/modules/art.js', 'utf8'), /See \.\.\/LICENSING\.txt/);
});

test('future publication gate rejects wrong event, branch, owner, confirmation and SHA', async () => {
  const env = { ...process.env, GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REPOSITORY: 'PedroCostinha/arcade-collection', GITHUB_REPOSITORY_OWNER: 'PedroCostinha', GITHUB_ACTOR: 'PedroCostinha', GITHUB_REF: 'refs/heads/main', PUBLISH_APPROVED: 'true', APPROVED_SHA: baseline.commit, GITHUB_SHA: baseline.commit };
  const run = overrides => spawnSync(process.execPath, ['scripts/verify-publication.mjs'], { env: { ...env, ...overrides }, encoding: 'utf8' });
  const valid = run({}); assert.equal(valid.status, 0, valid.stdout + valid.stderr);
  for (const invalid of [
    { GITHUB_EVENT_NAME: 'push' }, { GITHUB_EVENT_NAME: 'pull_request' },
    { GITHUB_REF: 'refs/heads/prep/collection-1.3.0' }, { GITHUB_REF: 'refs/tags/v1.3.0' },
    { GITHUB_ACTOR: 'another-user' }, { GITHUB_REPOSITORY_OWNER: 'another-user' },
    { GITHUB_REPOSITORY: 'PedroCostinha/PedroCostinha' }, { PUBLISH_APPROVED: 'false' },
    { PUBLISH_APPROVED: '' }, { APPROVED_SHA: baseline.commit.slice(0, 7) },
    { APPROVED_SHA: '' }, { APPROVED_SHA: '0'.repeat(40) }, { APPROVED_SHA: baseline.commit.toUpperCase() },
  ]) assert.notEqual(run(invalid).status, 0, JSON.stringify(invalid));
  const workflow = await readFile('.github/workflows/pages.yml', 'utf8');
  const triggers = workflow.match(/^on:\r?\n([\s\S]*?)^permissions:/m)?.[1];
  assert(triggers);
  assert.deepEqual([...triggers.matchAll(/^  (\w+):/gm)].map(match => match[1]), ['workflow_dispatch']);
  for (const condition of ["github.ref == 'refs/heads/main'", 'inputs.publish', 'inputs.expected_sha == github.sha', 'github.actor == github.repository_owner']) assert(workflow.includes(condition));
  assert.match(workflow, /permissions: \{\}/);
  assert.match(workflow, /path: dist\r?\n/);
  assert(!workflow.includes('path: prototype-dist'));
});

test('two clean builds are byte-reproducible and remove stale/unapproved files', async () => {
  build();
  const first = await manifest();
  await mkdir('dist/collection', { recursive: true });
  await writeFile('dist/collection/index.html', 'stale unapproved mockup');
  await writeFile('dist/internal-source.ts', 'stale source must not publish');
  build();
  assert.deepEqual(await manifest(), first);
  assert.deepEqual(Object.keys(first).sort(), allowlist);
});

test('historical review indicators remain only in prototype-dist without contaminating dist', async () => {
  const before = await manifest();
  build('scripts/build-prototypes.mjs');
  assert.match(await readFile('prototype-dist/collection/index.html', 'utf8'), /Estudo local/);
  assert(!/Estudo local|noindex|nofollow|em revisão/.test(await readFile('dist/collection/index.html', 'utf8')));
  assert.equal(await readFile('prototype-dist/code-snake/index.html', 'utf8'), await readFile('dist/code-snake/index.html', 'utf8'));
  assert.deepEqual(await manifest(), before);
  assert.deepEqual(Object.keys(await manifest()).sort(), allowlist);
});
