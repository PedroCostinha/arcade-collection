// SPDX-License-Identifier: MIT
// Copyright (c) 2026 PedroCostinha
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, firefox } from 'playwright';
import { serve } from '../../scripts/serve.mjs';

const engine = process.env.ARCADE_BROWSER ?? 'chrome';
assert(['chrome', 'firefox'].includes(engine));
const output = resolve(`docs/evidence/collection-1.3.0/${engine}`);
await mkdir(output, { recursive: true });
const production = await serve({ port: 0 });
const review = await serve({ port: 0, root: resolve('prototype-dist') });
const origin = `http://127.0.0.1:${review.address().port}`;
const productionOrigin = `http://127.0.0.1:${production.address().port}`;
const browser = engine === 'chrome' ? await chromium.launch({ channel: 'chrome', headless: true }) : await firefox.launch({ headless: true });
const errors = [], layouts = [], checks = [];
function observe(context) {
  context.on('page', page => {
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  });
  context.on('requestfailed', r => errors.push(`Failed ${r.url()}`));
  context.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`); });
  context.on('request', r => { if (new URL(r.url()).origin !== origin) errors.push(`External request ${r.url()}`); });
}
try {
  for (const prefix of ['/', '/arcade-collection/']) {
    for (const resource of ['collection/', 'collection/collection.css', 'collection/portraits/ember7.png', 'collection/portraits/nib.png']) {
      assert.equal((await fetch(productionOrigin + prefix + resource)).status, 404);
      const response = await fetch(origin + prefix + resource);
      assert.equal(response.status, 200);
      if (resource.endsWith('.png')) assert.equal(response.headers.get('content-type'), 'image/png');
      if (resource.endsWith('.css')) assert.match(response.headers.get('content-type'), /text\/css/);
    }
    assert.match(await (await fetch(origin + prefix)).text(), /Barrel Quest/);
  }
  checks.push('Review routes/assets return 200, production returns 404, preserved Barrel root at / and /arcade-collection/.');
  for (const javaScriptEnabled of [true, false]) {
    for (const reducedMotion of ['no-preference', 'reduce']) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, javaScriptEnabled, reducedMotion });
      observe(context);
      const page = await context.newPage();
      for (const prefix of ['/', '/arcade-collection/']) {
        const url = origin + prefix + 'collection/';
        await page.goto(url);
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('html').getAttribute('lang'), 'pt-BR');
        assert.match(await page.title(), /Arcade Collection/);
        assert.equal(await page.locator('script').count(), 0);
        assert.deepEqual(await page.locator('link[rel="stylesheet"]').evaluateAll(links => links.map(l => l.getAttribute('href'))), ['collection.css']);
        assert.equal(await page.locator('.play-link').nth(0).getAttribute('href'), '../');
        assert.equal(await page.locator('.play-link').nth(1).getAttribute('href'), '../code-snake/');
        for (const width of [320, 390, 768, 1024, 1440]) {
          await page.setViewportSize({ width, height: 1100 });
          const layout = await page.evaluate(() => {
            const cards = [...document.querySelectorAll('.game-card')].map(e => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; });
            return { viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth, cards };
          });
          assert(layout.scrollWidth <= width, `Overflow at ${width}`);
          if (width >= 768) assert.equal(layout.cards[0].y, layout.cards[1].y, 'Desktop cards side by side');
          else assert(layout.cards[1].y >= layout.cards[0].y + layout.cards[0].height, 'Mobile cards stack');
          for (const image of await page.locator('.portrait').all()) {
            assert(await image.isVisible());
            assert(await image.evaluate(i => i.complete && i.naturalWidth > 0));
            assert((await image.getAttribute('alt')).length > 10);
          }
          for (const link of await page.locator('.play-link').all()) {
            await link.scrollIntoViewIfNeeded();
            const box = await link.boundingBox();
            assert(box.width >= 44 && box.height >= 44);
            assert(box.x >= 0 && box.x + box.width <= width);
          }
          if (reducedMotion === 'reduce') assert(await page.locator('.play-link').first().evaluate(e => getComputedStyle(e).transitionDuration === '0s'));
          layouts.push({ prefix, javaScriptEnabled, reducedMotion, width, ...layout });
          if (prefix === '/arcade-collection/' && javaScriptEnabled && reducedMotion === 'no-preference' && [390, 1440].includes(width)) {
            await page.evaluate(() => scrollTo(0, 0));
            await page.screenshot({ path: resolve(output, `menu-${width}.png`), fullPage: true });
          }
        }
        await page.setViewportSize({ width: 1024, height: 844 });
        await page.goto(url);
        await page.keyboard.press('Tab');
        assert(await page.locator('.skip-link').evaluate(e => document.activeElement === e));
        assert((await page.locator('.skip-link').boundingBox()).y >= 0);
        await page.keyboard.press('Enter');
        assert(await page.locator('#games').evaluate(e => document.activeElement === e));
        await page.keyboard.press('Tab');
        assert(await page.locator('.play-link').first().evaluate(e => document.activeElement === e));
        const focus = await page.locator('.play-link').first().evaluate(e => ({ style: getComputedStyle(e).outlineStyle, width: getComputedStyle(e).outlineWidth }));
        assert.equal(focus.style, 'solid'); assert.equal(focus.width, '3px');
        await page.keyboard.press('Tab');
        assert(await page.locator('.play-link').last().evaluate(e => document.activeElement === e));
        await page.keyboard.press('Enter');
        await page.waitForURL(origin + prefix + 'code-snake/'); assert.match(await page.title(), /Code Snake/);
        await page.goBack();
        await page.locator('.play-link').first().click();
        await page.waitForURL(origin + prefix); assert.match(await page.title(), /Barrel Quest/);
        await page.goBack();
        await page.locator('.play-link').last().click();
        await page.waitForURL(origin + prefix + 'code-snake/');
        await page.goBack();
        await page.locator('.play-link').first().focus();
        await page.keyboard.press('Enter'); await page.waitForURL(origin + prefix);
        await page.goto(url);
        const contrasts = await page.evaluate(() => {
          const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
          const luminance = value => rgb(value).map(n => n / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4).reduce((sum, n, i) => sum + n * [.2126, .7152, .0722][i], 0);
          return [...document.querySelectorAll('.description,.game-type,.game-meta,.play-link,.intro-copy,.eyebrow,.section-heading,.review-badge,.character-label,footer p')].map(e => {
            let parent = e;
            while (parent.parentElement && getComputedStyle(parent).backgroundColor === 'rgba(0, 0, 0, 0)') parent = parent.parentElement;
            const foreground = getComputedStyle(e).color, background = getComputedStyle(parent).backgroundColor;
            const a = luminance(foreground), b = luminance(background);
            return { selector: e.className || e.tagName, foreground, background, ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) };
          });
        });
        for (const c of contrasts) assert(c.ratio >= 4.5, JSON.stringify(c));
        if (javaScriptEnabled && reducedMotion === 'no-preference' && prefix === '/') checks.push({ contrast: contrasts });
      }
      await context.close();
    }
  }
  checks.push('40 layouts per browser: 5 widths × 2 base paths × JavaScript on/off × reduced motion on/off; portraits, CSS, no overflow, 44px targets, semantic headings, keyboard skip/focus/activation, both mouse destinations and text contrast >=4.5:1.');
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: engine === 'chrome', javaScriptEnabled });
    observe(context);
    const page = await context.newPage(), base = origin + '/arcade-collection/';
    for (const [index, destination] of [[0, ''], [1, 'code-snake/']]) {
      await page.goto(base + 'collection/');
      await page.locator('.play-link').nth(index).tap();
      await page.waitForURL(base + destination);
    }
    await context.close();
  }
  checks.push('Emulated touch opens both games with JavaScript enabled and disabled.');
  assert.deepEqual(errors, []);
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ engine, browser: browser.version(), testedAt: new Date().toISOString(), artifact: 'prototype-dist', layouts, checks, errors, limitations: ['Headless browsers and emulated touch; no physical mobile hardware.', 'No real screen reader, Safari or exhaustive WCAG audit.', 'Without JavaScript the menu works; the games retain their existing JavaScript requirement.'] }, null, 2) + '\n');
  console.log(`${engine} ${browser.version()}: ${layouts.length} layouts passed; keyboard, mouse, touch, JS off, contrast, reduced motion and isolation passed.`);
} finally {
  await browser.close();
  for (const server of [review, production]) { server.closeAllConnections(); await new Promise(ok => server.close(ok)); }
}
