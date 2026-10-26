import { chromium, firefox } from 'playwright';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { serve } from '../scripts/serve.mjs';
import { pilot } from './pilot.mjs';

const engine = process.env.ARCADE_BROWSER ?? 'chrome';
assert(['chrome', 'firefox'].includes(engine));
const output = resolve('docs/evidence', engine);
await mkdir(output, { recursive: true });
await rm(resolve(output, 'results.json'), { force: true });
const server = await serve({ port: 0 });
const base = `http://127.0.0.1:${server.address().port}`;
const browser = engine === 'firefox' ? await firefox.launch({ headless: true }) : await chromium.launch({ channel: 'chrome', headless: true });
const errors = [], requests = [], checks = [];
const snapshot = page => page.evaluate(() => window.__BARREL_QUEST__.snapshot());
async function save(page, name) {
  // Chromium's compositor can capture a black canvas while its RAF clock is
  // mocked, despite a correct backing buffer. Capture on real RAF ticks, then
  // return to the controlled clock. This never changes the game state directly.
  if (engine === 'chrome') { await page.clock.resume(); await page.waitForTimeout(80); }
  const redPixels = await page.locator('canvas').evaluate(canvas => {
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let red = 0;
    for (let i = 0; i < pixels.length; i += 4) if (pixels[i] > 100 && pixels[i] > pixels[i + 1] * 1.5) red++;
    return red;
  });
  assert(redPixels > 500, 'Renderer has visible platforms and sprites, not a blank backing buffer');
  await page.screenshot({ path: resolve(output, name + '.png'), fullPage: true });
  if (engine === 'chrome') await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now() + 5000)));
}
async function setup(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, ...options });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => requests.push(request.url()));
  await page.clock.install({ time: new Date('2026-10-26T13:00:00Z') });
  await page.goto(`${base}/arcade-collection/?qa=1`);
  await page.getByRole('button', { name: 'Jogar agora', exact: true }).waitFor();
  await page.clock.pauseAt(new Date('2026-10-26T13:01:00Z'));
  return { context, page };
}
try {
  const { context, page } = await setup();
  assert.equal((await snapshot(page)).state, 'menu');
  await save(page, '01-menu');
  await page.getByRole('button', { name: 'Como jogar', exact: true }).first().click({ force: true });
  assert.equal((await snapshot(page)).state, 'instructions'); await save(page, '02-instructions');
  await page.getByRole('button', { name: 'Voltar', exact: true }).click({ force: true });
  await page.getByRole('button', { name: 'Jogar agora', exact: true }).click({ force: true });
  await page.clock.runFor(34);
  await page.keyboard.down('ArrowRight'); await page.clock.runFor(600); await page.keyboard.up('ArrowRight');
  assert((await snapshot(page)).player.x > 210); await save(page, '03-walking');
  await page.keyboard.down('Space'); await page.clock.runFor(130); await page.keyboard.up('Space');
  assert.equal((await snapshot(page)).player.floor, null); await save(page, '04-jump');
  await page.clock.runFor(650);
  await page.keyboard.press('Escape'); const paused = await snapshot(page);
  assert.equal(paused.state, 'paused'); await page.clock.runFor(2000);
  assert.deepEqual(await snapshot(page), paused); await save(page, '05-pause');
  await page.getByRole('button', { name: 'Como jogar', exact: true }).last().click({ force: true });
  await page.getByRole('button', { name: 'Voltar', exact: true }).click({ force: true });
  assert.equal((await snapshot(page)).state, 'paused');
  await page.getByRole('button', { name: 'Continuar missão', exact: true }).click({ force: true });
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  assert.equal((await snapshot(page)).state, 'paused');
  await page.getByRole('button', { name: 'Reiniciar partida', exact: true }).click({ force: true });
  assert.equal((await snapshot(page)).lives, 3); assert.equal((await snapshot(page)).score, 0);
  await page.keyboard.down('ArrowLeft'); await page.clock.runFor(5000); await page.keyboard.up('ArrowLeft');
  assert.equal((await snapshot(page)).state, 'gameover'); await save(page, '06-game-over');
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click({ force: true });
  assert.equal((await snapshot(page)).state, 'playing'); assert.equal((await snapshot(page)).lives, 3);
  checks.push('menu, instructions, keyboard walking/jumping, pause freezes clock, blur pause, three lives, game over, restart without navigation');

  let last = { move: 0, climb: 0, jump: false }, ladderShot = false, barrelShot = false;
  for (let n = 0; n < 1800; n++) {
    const s = await snapshot(page);
    if (s.state !== 'playing') break;
    const input = pilot(s);
    for (const [field, negative, positive] of [['move', 'ArrowLeft', 'ArrowRight'], ['climb', 'ArrowUp', 'ArrowDown']]) {
      if (input[field] !== last[field]) {
        if (last[field]) await page.keyboard.up(last[field] < 0 ? negative : positive);
        if (input[field]) await page.keyboard.down(input[field] < 0 ? negative : positive);
      }
    }
    if (input.jump !== last.jump) await page.keyboard[input.jump ? 'down' : 'up']('Space');
    last = input;
    await page.clock.runFor(40);
    if (!ladderShot && s.player.ladder !== null) { await save(page, '07-ladder'); ladderShot = true; }
    if (!barrelShot && s.player.lastFloor >= 2 && s.barrels.length > 3) { await save(page, '08-barrels'); barrelShot = true; }
  }
  const won = await snapshot(page);
  assert.equal(won.state, 'won', JSON.stringify(won)); assert.equal(won.cargo, 5); assert(won.score >= 1750);
  await save(page, '09-victory');
  await page.clock.runFor(1000); assert.deepEqual(await snapshot(page), won);
  await page.getByRole('button', { name: 'Como jogar', exact: true }).last().click({ force: true });
  await page.getByRole('button', { name: 'Voltar', exact: true }).click({ force: true });
  assert.equal((await snapshot(page)).state, 'menu'); assert.equal((await snapshot(page)).lives, 3);
  assert.equal((await snapshot(page)).score, 0);
  checks.push('complete playable mission with real keyboard events, live barrels, five deliveries and victory; no state mutation');
  await context.close();

  const mobileOptions = engine === 'chrome' ? { isMobile: true, hasTouch: true } : {};
  const mobile = await setup({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', ...mobileOptions });
  const m = mobile.page;
  assert(await m.getByLabel('Reduzir efeitos visuais').isChecked());
  await save(m, '10-mobile-menu');
  await m.getByRole('button', { name: 'Jogar agora', exact: true }).click({ force: true });
  await m.clock.runFor(34);
  assert.deepEqual(await m.locator('canvas').evaluate(c => [c.width, c.height]), [480, 360]);
  if (engine === 'chrome') {
    const cdp = await mobile.context.newCDPSession(m);
    const right = await m.getByRole('button', { name: 'Andar para direita', exact: true }).boundingBox();
    const jump = await m.getByRole('button', { name: 'Pular', exact: true }).boundingBox();
    const r = { x: Math.round(right.x + right.width / 2), y: Math.round(right.y + right.height / 2), id: 1 };
    const j = { x: Math.round(jump.x + jump.width / 2), y: Math.round(jump.y + jump.height / 2), id: 2 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [r] });
    await m.clock.runFor(200); const x = (await snapshot(m)).player.x; assert(x > 145);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [r, j] });
    await m.clock.runFor(100); assert.equal((await snapshot(m)).player.floor, null);
    await save(m, '11-mobile-touch-jump');
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [r] });
    await m.clock.runFor(100); assert((await snapshot(m)).player.x > x + 10);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    await m.clock.runFor(500); assert.equal((await snapshot(m)).player.vx, 0);
    checks.push('Chrome mobile emulation: simultaneous direction+jump touch, pointer cancellation releases input');
  }
  await m.getByRole('button', { name: 'Pausar', exact: true }).click({ force: true });
  const reduced = await snapshot(m); await m.clock.runFor(1000); assert.deepEqual(await snapshot(m), reduced);
  for (const width of [320, 390, 768, 1440]) {
    await m.setViewportSize({ width, height: 1000 }); await m.clock.runFor(34);
    assert(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No overflow at ${width}`);
    const canvas = await m.locator('canvas').boundingBox(); assert(canvas.width <= width);
  }
  checks.push('reduced motion default, compact camera, 320/390/768/1440px without overflow, project subpath, no external requests');
  assert.equal(errors.length, 0, errors.join('\n'));
  assert(requests.every(url => new URL(url).origin === base), 'No external fonts, scripts, data or authenticated requests');
  const result = { engine, browser: await browser.version(), testedAt: new Date().toISOString(), tests: checks, mission: won, errors,
    requestCount: requests.length, testClock: 'Playwright RAF clock; inputs go through DOM keyboard/pointer events',
    limitations: 'Mobile is emulation, not physical hardware. Safari and real screen readers not executed.' };
  await writeFile(resolve(output, 'results.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ engine, browser: result.browser, checks, score: won.score, lives: won.lives, time: won.elapsed, errors }, null, 2));
  await mobile.context.close();
} finally {
  await browser.close(); server.closeAllConnections(); await new Promise(ok => server.close(ok));
}
