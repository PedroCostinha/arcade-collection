// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import { spawnSync } from 'node:child_process';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'prototype-dist');
if (dirname(output) !== resolve(root)) throw new Error('Output must be inside project');
const result = spawnSync(process.execPath, ['scripts/build.mjs'], { cwd: root, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(resolve(root, 'dist'), output, { recursive: true });
// Only this development command includes the unapproved home study.
await cp(resolve(root, 'prototypes/collection'), resolve(output, 'collection'), { recursive: true });
await writeFile(resolve(output, 'REVIEW-ONLY.txt'), 'Development build: collection/ is an unapproved home study. Publish only dist/ after explicit approval.\n');
console.log('Development only: prototype-dist/ includes the collection/ mockup. Never upload this directory.');
