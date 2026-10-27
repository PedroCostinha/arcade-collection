// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, firefox } from 'playwright';
import { serve } from '../../../scripts/serve.mjs';
const engine=process.env.ARCADE_BROWSER??'chrome';
assert(['chrome','firefox'].includes(engine));
const output=resolve(process.env.SNAKE_EVIDENCE_DIR??`test-results/code-snake/${engine}`);
await mkdir(output,{recursive:true});
const server=await serve({port:0});
const base=`http://127.0.0.1:${server.address().port}/arcade-collection/`;
const browser=engine==='firefox'?await firefox.launch({headless:true}):await chromium.launch({channel:'chrome',headless:true});
const errors=[],requests=[],checks=[],layouts=[];
function observe(context) {
  context.on('page', page => {
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', message => { if(message.type()==='error') errors.push(`${message.text()} ${message.location().url}`); });
  });
  context.on('request', r => requests.push(r.url()));
  context.on('requestfailed', r => errors.push(`Failed request: ${r.url()}`));
  context.on('response', r => { if(r.status()>=400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });
}
try {
  const context=await browser.newContext({viewport:{width:1440,height:844}});
  observe(context);
  const page=await context.newPage();
  await page.clock.install({time:new Date('2026-10-27T15:00:00Z')});
  await page.goto(base+'code-snake/');
  assert.equal(await page.title(),'Code Snake · Arcade Collection');
  assert(!/protótipo|collection\//i.test(await page.locator('body').innerText()));
  await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now()+10000)));
  assert.match(await page.locator('#status').innerText(),/Pronto/);
  const start=await page.locator('#play').boundingBox();
  assert(start.y>=0&&start.y+start.height<=844,'Start is fully visible before any scroll');
  assert.equal(await page.evaluate(()=>scrollY),0);
  await page.screenshot({path:resolve(output,'00-desktop-first-screen.png')});
  await page.screenshot({path:resolve(output,'01-desktop-menu.png'),fullPage:true});
  await page.getByRole('button',{name:'Iniciar partida'}).focus();await page.keyboard.press('Space');
  assert(await page.locator('canvas').evaluate(c=>c===document.activeElement));
  await page.clock.runFor(670);assert.equal(await page.locator('#score').innerText(),'0010');
  await page.keyboard.press('ArrowUp');await page.clock.runFor(160);
  await page.keyboard.press('ArrowLeft');await page.clock.runFor(160);
  await page.keyboard.press('p');assert.match(await page.locator('#status').innerText(),/pausada/);
  await page.clock.runFor(34);
  const paused=await page.locator('canvas').evaluate(c=>c.toDataURL());await page.clock.runFor(2000);assert(await page.locator('canvas').evaluate((c,expected)=>c.toDataURL()===expected,paused),'Paused canvas remains pixel-identical');
  await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.match(await page.locator('#status').innerText(),/pausada/);
  await page.getByRole('button',{name:'Reiniciar',exact:true}).click();assert.equal(await page.locator('#score').innerText(),'0000');
  await page.clock.runFor(3200);assert.match(await page.locator('#status').innerText(),/Fim de partida/);
  await page.screenshot({path:resolve(output,'02-game-over.png'),fullPage:true});
  await page.getByRole('button',{name:'Reiniciar',exact:true}).click();
  await page.clock.runFor(670);await page.keyboard.press('p');await page.clock.runFor(20);
  await page.screenshot({path:resolve(output,'03-desktop-playing.png'),fullPage:true});
  checks.push('Native keyboard start/focus, first collection +10, quick turns, pause freeze, blur pause, wall Game Over, restart');
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:844});
    await page.evaluate(()=>scrollTo(0,0));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No horizontal overflow at ${width}`);
    const box=await page.getByRole('button',{name:'Cima',exact:true}).boundingBox();assert(box.width>=44&&box.height>=44);
    const play=await page.locator('#play').boundingBox(),pause=await page.locator('#pause').boundingBox();
    const canvas=await page.locator('canvas').boundingBox();
    assert(play.y>=0&&play.y+play.height<=844,`Initial action visible at ${width}x844`);
    assert(play.y+play.height<canvas.y,'Actions precede the board');
    assert([play,pause].every(b=>b.width>=44&&b.height>=44));
    layouts.push({width,height:844,play,pause,canvas,dpad:box});
    await page.screenshot({path:resolve(output,`first-screen-${width}.png`)});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  for(let i=0;i<20 && !(await page.locator('#reduced').isChecked());i++) await new Promise(ok=>setTimeout(ok,50));
  assert(await page.locator('#reduced').isChecked());
  await page.setViewportSize({width:390,height:1000});
  await page.screenshot({path:resolve(output,'04-mobile-reduced.png'),fullPage:true});
  checks.push('320/390/768/1440x844 contained; start visible without scrolling, actions before Canvas, 44px+ action/directional targets; reduced motion');
  await page.getByRole('button',{name:'Reiniciar',exact:true}).click();
  await page.clock.runFor(670);assert.equal(await page.locator('#score').innerText(),'0010');
  for(const key of ['ArrowDown','ArrowLeft','ArrowUp']) { await page.keyboard.press(key);await page.clock.runFor(160); }
  assert.match(await page.locator('#status').innerText(),/Fim de partida/,'Real DOM turns collide with the grown body');
  assert.equal(await page.locator('#score').innerText(),'0010');
  await page.getByRole('button',{name:'Reiniciar',exact:true}).click();
  await page.keyboard.press('w');await page.clock.runFor(160);await page.keyboard.press('Escape');
  assert.match(await page.locator('#status').innerText(),/pausada/);
  checks.push('Grown-body collision through DOM turns; terminal score retained, restart and WASD/Escape');
  const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:engine==='chrome',reducedMotion:'reduce'});
  observe(touch);
  const touchPage=await touch.newPage();
  await touchPage.clock.install({time:new Date('2026-10-27T15:00:00Z')});
  await touchPage.goto(base+'code-snake/');
  await touchPage.clock.pauseAt(new Date(await touchPage.evaluate(()=>Date.now()+10000)));
  assert(await touchPage.locator('#reduced').isChecked());
  const touchStart=await touchPage.locator('#play').boundingBox();
  assert(touchStart.y>=0&&touchStart.y+touchStart.height<=844);
  await touchPage.screenshot({path:resolve(output,'00-mobile-first-screen.png')});
  await touchPage.getByRole('button',{name:'Iniciar partida'}).tap();
  assert(await touchPage.locator('canvas').evaluate(c=>c===document.activeElement));
  await touchPage.clock.runFor(670);assert.equal(await touchPage.locator('#score').innerText(),'0010');
  await touchPage.getByRole('button',{name:'Cima',exact:true}).tap();
  await touchPage.clock.runFor(160);
  await touchPage.getByRole('button',{name:'Pausar',exact:true}).tap();assert.match(await touchPage.locator('#status').innerText(),/pausada/);
  await touchPage.getByRole('button',{name:'Continuar',exact:true}).tap();
  assert(await touchPage.locator('canvas').evaluate(c=>c===document.activeElement));
  await touchPage.getByRole('button',{name:'Reiniciar',exact:true}).tap();assert.equal(await touchPage.locator('#score').innerText(),'0000');
  await touch.close();checks.push('Emulated touch start, collection +10, direction, pause/resume focus, restart and reduced motion');
  for(const [name,expected] of [['Código MIT / arte reservada',/Nib[\s\S]*LicenseRef-Arcade-Art-Reserved/],['Licença MIT integral',/MIT License/]]) {
    const link=page.getByRole('link',{name,exact:true});
    await link.scrollIntoViewIfNeeded();assert(await link.isVisible());
    const url=new URL(await link.getAttribute('href'),base+'code-snake/');
    assert(url.href.startsWith(base));
    // Validate plain-text terms by HTTP. Chromium's standalone text viewer
    // requests /favicon.ico at the host root, outside this project site.
    const response=await context.request.get(url.href);
    assert.equal(response.status(),200);
    assert.match(response.headers()['content-type'],/text\/plain/);
    assert.match(await response.text(),expected);
  }
  await page.getByRole('link',{name:'Jogar Barrel Quest'}).click();assert.match(await page.title(),/Barrel Quest/);await page.getByRole('button',{name:'Jogar agora',exact:true}).waitFor({state:'visible'});
  assert.match(await page.locator('body').innerText(),/V1\.1\.0/);
  assert.equal(errors.length,0,errors.join('\n'));assert(requests.every(url=>url.startsWith(base)));
  checks.push('Production dist/ under /arcade-collection/: visible legal links with HTTP 200 full terms and preserved Barrel root; no failed/external game requests or page errors in desktop/touch contexts');
  await writeFile(resolve(output,'results.json'),JSON.stringify({artifact:'dist',route:'/arcade-collection/code-snake/',engine,version:browser.version(),checks,layouts,errors,requests},null,2));
  console.log(JSON.stringify({engine,checks},null,2));
  await context.close();
}finally{await browser.close();server.closeAllConnections();await new Promise(ok=>server.close(ok));}
