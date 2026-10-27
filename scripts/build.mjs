// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import { spawnSync } from 'node:child_process';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
// The original clean build owns the root. Snake only adds its own directory.
for (const args of [
  ['scripts/build-barrel.mjs'],
  ['node_modules/typescript/bin/tsc', '-p', 'games/code-snake/tsconfig.json'],
]) {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const output = resolve(root, 'dist/code-snake');
for (const file of ['index.html', 'style.css']) {
  await copyFile(resolve(root, 'games/code-snake/public', file), resolve(output, file));
}
await copyFile(resolve(root, 'games/code-snake/LICENSING.md'), resolve(output, 'LICENSING.txt'));
for (const name of ['core', 'render', 'app', 'art']) {
  const marker = `SPDX-License-Identifier: ${name === 'art' ? 'LicenseRef-Arcade-Art-Reserved' : 'MIT'}`;
  const source = await readFile(resolve(root, `games/code-snake/src/${name}.ts`), 'utf8');
  if (!source.includes(marker)) throw new Error(`Missing Snake license scope: ${name}`);
  const file = resolve(output, `modules/${name}.js`);
  let emitted = await readFile(file, 'utf8');
  if (emitted.includes('SPDX-License-Identifier:') && !emitted.includes(marker)) throw new Error(`Conflicting Snake license: ${name}`);
  if (!emitted.includes(marker)) emitted = `// ${marker}\n// Copyright (c) 2026 PedroCostinha${name === 'art' ? '. All rights reserved. See ../LICENSING.txt.' : ''}\n${emitted}`;
  // Keep the original art source intact while pointing its emitted notice at the shipped terms.
  if (name === 'art') emitted = emitted.replace('See LICENSING.md.', 'See ../LICENSING.txt.');
  await writeFile(file, emitted);
}
console.log('Collection 1.2.0 candidate: dist/ (Barrel Quest 1.1.0 + code-snake/). No collection/ mockup.');
