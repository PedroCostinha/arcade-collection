// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { verifyCollection } from './verify-collection.mjs';

// Read-only gate; does not dispatch, configure or publish anything.
const env = process.env;
assert.equal(env.GITHUB_EVENT_NAME, 'workflow_dispatch');
assert.equal(env.GITHUB_REPOSITORY, 'PedroCostinha/arcade-collection');
assert.equal(env.GITHUB_REPOSITORY_OWNER, 'PedroCostinha');
assert.equal(env.GITHUB_ACTOR, 'PedroCostinha', 'Only the owner can approve publication');
assert.equal(env.GITHUB_REF, 'refs/heads/main');
assert.equal(env.PUBLISH_APPROVED, 'true');
assert.match(env.APPROVED_SHA ?? '', /^[0-9a-f]{40}$/, 'A full exact approved SHA is required');
assert.equal(env.APPROVED_SHA, env.GITHUB_SHA);
const json = async file => JSON.parse(await readFile(new URL(file, new URL('../', import.meta.url)), 'utf8'));
const pkg = await json('package.json'), lock = await json('package-lock.json');
assert.equal(pkg.version, '1.3.0');
assert.equal(lock.version, pkg.version);
assert.equal(lock.packages[''].version, pkg.version);
await verifyCollection(fileURLToPath(new URL('../dist/', import.meta.url)));
const menu = await readFile(new URL('../dist/collection/index.html', import.meta.url), 'utf8');
assert(menu.includes('COLEÇÃO 1.3.0'));
const root = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const snake = await readFile(new URL('../dist/code-snake/index.html', import.meta.url), 'utf8');
assert(root.includes('V1.1.0'), 'Preserve the individual Barrel version');
assert(!root.includes('V1.2.0'));
// Frozen game HTML records the 1.2.0 publication; it is not the current package version.
assert(snake.includes('COLEÇÃO 1.2.0'));
assert(!/protótipo|noindex|collection\//i.test(snake));
console.log('Publication gate verified: owner, manual main event, approval, exact SHA, collection 1.3.0 and Barrel 1.1.0. No publication performed by this script.');
