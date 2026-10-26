// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function serve({ port = 4173, root = fileURLToPath(new URL('../dist/', import.meta.url)) } = {}) {
  root = resolve(root);
  const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8' };
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      let relative = decodeURIComponent(url.pathname);
      // Exercise a project-site subpath locally, without requiring an SPA rewrite.
      if (relative.startsWith('/arcade-collection/')) relative = relative.slice('/arcade-collection'.length);
      const file = resolve(root, '.' + (relative.endsWith('/') ? relative + 'index.html' : relative));
      if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
      if (!(await stat(file)).isFile()) throw new Error('not a file');
      res.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'");
      res.end(await readFile(file));
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise((ok, fail) => { server.once('error', fail); server.listen(port, '127.0.0.1', ok); });
  return server;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = await serve({ port: Number(process.env.PORT ?? 4173) });
  console.log(`Local: http://127.0.0.1:${server.address().port}/`);
}
