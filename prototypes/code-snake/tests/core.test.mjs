// SPDX-License-Identifier: MIT
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { SnakeGame, WIDTH, HEIGHT } from '../../../prototype-dist/code-snake/modules/core.js';
import { serve } from '../../../scripts/serve.mjs';

test('start, exact collection, growth, score and deterministic spawn on free cells',()=>{
  const g=new SnakeGame(()=>0); assert.equal(g.status,'menu');g.reset();
  for(let i=0;i<4;i++)g.step();
  assert.equal(g.score,10);assert.equal(g.body.length,5);assert.deepEqual(g.item,{x:0,y:0});
  assert(!g.body.some(p=>p.x===g.item.x&&p.y===g.item.y));
});
test('bounded turn queue rejects reversals and accepts two quick orthogonal taps',()=>{
  const g=new SnakeGame();g.reset();g.turn('left');assert.deepEqual(g.queue,[]);
  g.turn('up');g.turn('left');g.turn('down');assert.deepEqual(g.queue,['up','left']);
  g.step();assert.deepEqual(g.body[0],{x:5,y:7});g.step();assert.deepEqual(g.body[0],{x:4,y:7});
});
test('pause and terminal states freeze model; restart clears all session state',()=>{
  const g=new SnakeGame();g.reset();g.pause();const paused=JSON.stringify(g);g.step();g.turn('up');assert.equal(JSON.stringify(g),paused);
  g.resume();for(let i=0;i<WIDTH;i++)g.step();assert.equal(g.status,'over');const over=JSON.stringify(g);g.step();assert.equal(JSON.stringify(g),over);
  g.reset();assert.equal(g.score,0);assert.equal(g.body.length,4);assert.equal(g.status,'playing');
});
test('body collision, vacated tail and growing tail are handled distinctly',()=>{
  const g=new SnakeGame();g.reset();g.body=[{x:2,y:2},{x:2,y:3},{x:1,y:3},{x:1,y:2}];g.direction='up';g.turn('left');g.item={x:8,y:8};g.step();assert.equal(g.status,'playing');
  g.body=[{x:2,y:2},{x:2,y:3},{x:1,y:3},{x:1,y:2}];g.direction='up';g.queue=['left'];g.item={x:1,y:2};g.step();assert.equal(g.status,'over');
  g.reset();g.body=[{x:2,y:2},{x:3,y:2},{x:3,y:3},{x:2,y:3},{x:1,y:3}];g.direction='left';g.queue=['down'];g.step();assert.equal(g.status,'over');
});
test('full board wins; RNG endpoints and invalid samples never create occupied items',()=>{
  for(const random of [()=>0,()=>0.999999]) {const g=new SnakeGame(random);g.body=Array.from({length:WIDTH*HEIGHT-1},(_,i)=>({x:i%WIDTH,y:Math.floor(i/WIDTH)}));g.spawn();assert.deepEqual(g.item,{x:WIDTH-1,y:HEIGHT-1});g.body.push(g.item);g.spawn();assert.equal(g.status,'won');assert.equal(g.item,null);}
  for(const n of [-1,1,NaN,Infinity]) {const g=new SnakeGame(()=>n);assert.throws(()=>g.spawn());}
});
test('review routes resolve under project subpath; default artifact excludes prototypes',async()=>{
  const server=await serve({port:0,root:'prototype-dist'});
  const base=`http://127.0.0.1:${server.address().port}/arcade-collection/`;
  try {
    for(const path of ['', 'code-snake/', 'collection/'])assert.equal((await fetch(base+path)).status,200);
    const html=await(await fetch(base+'code-snake/')).text();
    for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){const url=new URL(match[1],base+'code-snake/');assert.equal((await fetch(url)).status,200,url.href);}
    assert.match(html,/Não representam commits/);
    assert.equal(await readFile('dist/index.html','utf8'),await readFile('prototype-dist/index.html','utf8'));
    assert(!(await readdir('dist')).includes('code-snake'));
    for(const path of ['core','app','render'])assert.match(await readFile(`prototype-dist/code-snake/modules/${path}.js`,'utf8'),/SPDX-License-Identifier: MIT/);
    assert.match(await readFile('prototype-dist/code-snake/modules/art.js','utf8'),/LicenseRef-Arcade-Art-Reserved/);
  } finally {server.closeAllConnections();await new Promise(ok=>server.close(ok));}
});
