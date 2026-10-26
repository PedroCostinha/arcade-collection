// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import { spawnSync } from 'node:child_process';
import { mkdir, copyFile, rm, readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
// Publish only this build, never obsolete output from a previous source tree.
const output = resolve(root, 'dist');
if (dirname(output) !== resolve(root)) throw new Error('Build output must be inside the project');
await rm(output, { recursive: true, force: true });
const result = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'], { cwd: root, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
// TypeScript can drop leading comments attached to an erased type-only import.
// Preserve each original module's scope on the JavaScript we actually distribute.
async function preserveNotices(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) { await preserveNotices(file); continue; }
    if (!entry.name.endsWith('.js')) continue;
    const path = relative(output, file).split(sep).join('/');
    const license = path.startsWith('art/') ? 'LicenseRef-Arcade-Art-Reserved' : 'MIT';
    const marker = `SPDX-License-Identifier: ${license}`;
    const source = await readFile(resolve(root, 'src', path.replace(/\.js$/, '.ts')), 'utf8');
    if (!source.includes(marker)) throw new Error(`Missing source license scope: ${path}`);
    const code = await readFile(file, 'utf8');
    if (code.includes('SPDX-License-Identifier:') && !code.includes(marker)) throw new Error(`Conflicting emitted license: ${path}`);
    if (!code.includes(marker)) await writeFile(file, `// ${marker}\n// Copyright (c) 2026 PedroCostinha${license === 'MIT' ? '' : '. All rights reserved. See ART-RIGHTS.txt.'}\n${code}`);
  }
}
await preserveNotices(output);
for (const file of ['styles.css', 'theme.css', 'favicon.svg', '.nojekyll']) {
  await copyFile(new URL(`../public/${file}`, import.meta.url), new URL(`../dist/${file}`, import.meta.url));
}
const { IDENTITY } = await import(pathToFileURL(resolve(output, 'art/identity.js')).href);
let html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
for (const [key, value] of Object.entries(IDENTITY)) html = html.replaceAll(`{{${key}}}`, escape(value));
if (/\{\{[^}]+\}\}/.test(html)) throw new Error('Unresolved identity placeholder');
await writeFile(resolve(output, 'index.html'), html);
for (const file of ['LICENSE-CODE.txt', 'ART-RIGHTS.txt']) await copyFile(resolve(root, file), resolve(output, file));
await copyFile(resolve(root, 'LICENSING.md'), resolve(output, 'LICENSING.txt'));
console.log('Build ready: dist/ (static files, relative URLs, no server runtime).');
