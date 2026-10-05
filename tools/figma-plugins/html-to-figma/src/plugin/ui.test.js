import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { build } from 'esbuild';

async function bundledUi() {
  const ui = await readFile(join(import.meta.dirname, 'ui.html'), 'utf8');
  const bundle = await build({ entryPoints:['src/plugin/browser.js'], bundle:true, platform:'browser', format:'iife', write:false });
  return ui.replace('<!-- H2F_BROWSER_BUNDLE -->', `<script>${bundle.outputFiles[0].text}</script>`);
}

test('imports actual HTML thumbnails in order without calling a local service', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const requests = [];
    await page.route(/^https?:/, (route) => { requests.push(route.request().url()); route.abort(); });
    await page.setContent(await bundledUi());
    assert.equal(await page.locator('.step').count(), 3);
    for (const selector of ['#token', '#url', '#mode', '#selector', '#spacing']) assert.equal(await page.locator(selector).count(), 0);
    await page.locator('#files').setInputFiles({name:'deck.html',mimeType:'text/html',buffer:Buffer.from(
      '<style>.slide{width:800px;height:450px} [hidden]{display:none!important}</style><section class="slide" data-page-id="a" style="background:red">First</section><section class="slide" data-page-id="b" hidden style="background:blue">Second</section>'
    )});
    await page.locator('#next').click();
    await page.locator('.page-item').first().waitFor();
    assert.equal(await page.locator('.page-item img[src^="data:image/png;base64,"]').count(), 2);
    assert.deepEqual(requests, []);
    await page.locator('.page-item').first().locator('[data-move="down"]').click();
    assert.equal(await page.locator('.page-item').first().locator('.page-title').textContent(), 'b');
    await page.evaluate(() => { window.importMessage = null; window.addEventListener('message', (event) => { if (event.data.pluginMessage?.type === 'import') window.importMessage = event.data.pluginMessage; }); });
    await page.locator('#next').click();
    await page.waitForFunction(() => window.importMessage !== null);
    assert.deepEqual(await page.evaluate(() => window.importMessage.order), ['b', 'a']);
    assert.equal(await page.evaluate(() => window.importMessage.capture.pages[0].thumbnail), undefined);
  } finally { await browser.close(); }
});

test('keeps import controls inside the 760 by 650 plugin dialog', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({viewport:{width:760,height:650}});
    await page.setContent(await bundledUi());
    const layout = await page.evaluate(() => ({
      height:document.documentElement.scrollHeight,
      buttonBottom:document.querySelector('#next').getBoundingClientRect().bottom,
      extraIntro:!!document.querySelector('.intro'),
      subline:document.querySelector('header small')?.textContent
    }));
    assert.ok(layout.height <= 650, JSON.stringify(layout));
    assert.ok(layout.buttonBottom <= 650, JSON.stringify(layout));
    assert.equal(layout.extraIntro, false);
    assert.equal(layout.subline, undefined);
  } finally { await browser.close(); }
});
