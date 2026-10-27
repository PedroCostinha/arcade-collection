// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import { spawnSync } from 'node:child_process';
import { cp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const output=resolve(root,'prototype-dist');
if(dirname(output)!==resolve(root)) throw new Error('Output must be inside project');
// Keep the publishing build entirely unaware of prototypes.
for(const args of [['scripts/build.mjs'],['node_modules/typescript/bin/tsc','-p','prototypes/code-snake/tsconfig.json']]) {
  if(args[0]==='scripts/build.mjs') { await rm(output,{recursive:true,force:true}); await mkdir(output,{recursive:true}); }
  const result=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});
  if(result.status!==0) process.exit(result.status??1);
  if(args[0]==='scripts/build.mjs') await cp(resolve(root,'dist'),output,{recursive:true});
}
await cp(resolve(root,'prototypes/code-snake/public'),resolve(output,'code-snake'),{recursive:true});
for (const name of ['core','render','app','art']) {
  const marker = `SPDX-License-Identifier: ${name === 'art' ? 'LicenseRef-Arcade-Art-Reserved' : 'MIT'}`;
  const source = await readFile(resolve(root,`prototypes/code-snake/src/${name}.ts`),'utf8');
  if (!source.includes(marker)) throw new Error(`Missing license scope: ${name}`);
  const file=resolve(output,`code-snake/modules/${name}.js`), emitted=await readFile(file,'utf8');
  if (!emitted.includes(marker)) await writeFile(file,`// ${marker}\n// Copyright (c) 2026 PedroCostinha${name==='art'?'. All rights reserved.':''}\n${emitted}`);
}
await cp(resolve(root,'prototypes/collection'),resolve(output,'collection'),{recursive:true});
for(const file of ['LICENSE-CODE.txt','ART-RIGHTS.txt','LICENSING.md']) await cp(resolve(root,file),resolve(output,file));
await cp(resolve(root,'prototypes/code-snake/LICENSING.md'),resolve(output,'CODE-SNAKE-LICENSING.md'));
await writeFile(resolve(output,'REVIEW-ONLY.txt'),'Local review build. Not authorized for deployment. Barrel Quest remains 1.1.0; Code Snake is an unversioned prototype.\n');
console.log('Review only: prototype-dist/; /code-snake/ and /collection/. Publishing dist/ remains unchanged.');
