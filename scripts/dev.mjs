// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import { spawnSync } from 'node:child_process';
import { serve } from './serve.mjs';
const build = spawnSync(process.execPath, ['scripts/build.mjs'], { stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status ?? 1);
const server = await serve({ port: Number(process.env.PORT ?? 4173) });
console.log(`Local: http://127.0.0.1:${server.address().port}/`);
console.log('Rebuild with npm run build after source edits; refresh the browser.');
