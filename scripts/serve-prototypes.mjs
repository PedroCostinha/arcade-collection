// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import { serve } from './serve.mjs';
import { fileURLToPath } from 'node:url';
const server=await serve({port:Number(process.env.PORT??4175),root:fileURLToPath(new URL('../prototype-dist/',import.meta.url))});
console.log(`Review: http://127.0.0.1:${server.address().port}/arcade-collection/code-snake/`);
