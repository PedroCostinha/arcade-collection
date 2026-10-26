import { spawnSync } from 'node:child_process';
import { mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const result = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'], { cwd: root, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
for (const file of ['index.html', 'styles.css', 'favicon.svg', '.nojekyll']) {
  await copyFile(new URL(`../public/${file}`, import.meta.url), new URL(`../dist/${file}`, import.meta.url));
}
console.log('Build ready: dist/ (static files, relative URLs, no server runtime).');
