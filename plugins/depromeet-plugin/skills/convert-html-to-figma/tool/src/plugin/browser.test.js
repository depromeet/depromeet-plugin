import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { zipSync, strToU8 } from 'fflate';

async function browserHarness(fn) {
  const bundle = await build({ entryPoints: ['src/plugin/browser.js'], bundle: true, platform: 'browser', format: 'iife', write: false });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent('<div id="host"></div>');
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    return await fn(page);
  } finally { await browser.close(); }
}

test('captures hidden HTML pages and distinct rendered thumbnails without a service', async () => browserHarness(async (page) => {
  const result = await page.evaluate(async () => {
    const html = '<style>.slide{width:800px;height:450px;display:flex;align-items:center;font:32px Arial}</style>' +
      '<section class="slide" data-page-id="one" style="background:#f00">First page</section>' +
      '<section class="slide" data-page-id="two" hidden style="background:#00f">Second page</section>' +
      '<script>parent.hacked=true</script>';
    const files = [new File([html], 'deck.html', { type: 'text/html' })];
    return window.h2f.captureFiles(files, document.querySelector('#host'));
  });
  assert.deepEqual(result.pages.map(({id, name, width, height}) => [id, name, width, height]), [
    ['one', 'one', 800, 450], ['two', 'two', 800, 450]
  ]);
  assert.ok(result.pages.every((item) => item.thumbnail.startsWith('data:image/png;base64,')));
  assert.notEqual(result.pages[0].thumbnail, result.pages[1].thumbnail);
  assert.ok(result.pages[1].elements.some((item) => item.kind === 'text' && item.text === 'Second page'));
  assert.equal(await page.evaluate(() => window.hacked), undefined);
}));

test('resolves ZIP CSS and image paths inside the plugin without network requests', async () => browserHarness(async (page) => {
  const dot = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lH8AAAAASUVORK5CYII=', 'base64'));
  const zip = zipSync({
    'deck/index.html': strToU8('<title>Deck Title</title><link rel="stylesheet" href="style.css"><section data-page-id="first"><h1>ZIP works</h1><img src="dot.png"></section><section data-page-id="second" hidden>Next</section>'),
    'deck/style.css': strToU8('section{width:800px;height:450px;background:#123456 url(dot.png) no-repeat} h1{font-size:32px}'),
    'deck/dot.png': dot
  });
  const external = [];
  await page.route(/^https?:/, (route) => { external.push(route.request().url()); route.abort(); });
  const result = await page.evaluate(async (bytes) => window.h2f.captureFiles(
    [new File([new Uint8Array(bytes)], 'deck.zip', {type:'application/zip'})], document.querySelector('#host')
  ), [...zip]);
  assert.equal(result.pages.length, 2);
  assert.equal(result.title, 'Deck Title');
  assert.equal(result.pages[0].width, 800);
  assert.ok(result.pages[0].elements.some((item) => item.kind === 'image' && item.data));
  assert.ok(result.pages[0].elements.some((item) => item.kind === 'text' && item.text === 'ZIP works'));
  assert.deepEqual(external, []);
}));

test('blocks external resources and navigation declared by an uploaded HTML file', async () => browserHarness(async (page) => {
  const requests = [];
  await page.route(/^https?:/, (route) => { requests.push(route.request().url()); route.abort(); });
  const result = await page.evaluate(async () => window.h2f.captureFiles([new File([
    '<meta http-equiv="refresh" content="0;url=https://example.com/next"><link rel="preload" as="image" href="https://example.com/pixel.png"><style>@import url(https://example.com/theme.css);div{width:800px;height:450px;background-image:url(https://example.com/bg.png)}</style><div>Local</div>'
  ], 'local.html', {type:'text/html'})], document.querySelector('#host')));
  assert.equal(result.pages.length, 1);
  assert.deepEqual(requests, []);
  assert.ok(result.warnings.some((warning) => warning.includes('external asset')));
}));

test('bounds portrait thumbnails to the preview size', async () => browserHarness(async (page) => {
  const result = await page.evaluate(async () => window.h2f.captureFiles([new File([
    '<style>.slide{width:400px;height:1200px;background:#123456}</style><section class="slide" data-page-id="one">Tall</section><section class="slide" data-page-id="two" hidden>Next</section>'
  ], 'tall.html', {type:'text/html'})], document.querySelector('#host')));
  const png = Buffer.from(result.pages[0].thumbnail.split(',')[1], 'base64');
  assert.ok(png.readUInt32BE(16) <= 320);
  assert.ok(png.readUInt32BE(20) <= 180);
}));

test('keeps inline text fragments on one line for editable Figma text', async () => browserHarness(async (page) => {
  const result = await page.evaluate(async () => window.h2f.captureFiles([new File([
    '<style>section{width:800px;height:450px}h3{font-size:44px}</style><section><h3><span>01</span> · 기억</h3></section>'
  ], 'cards.html', {type:'text/html'})], document.querySelector('#host')));
  const number = result.pages[0].elements.find((item) => item.kind === 'text' && item.text === '01');
  assert.equal(number.noWrap, true);
}));

test('rejects a ZIP path that escapes the archive root', async () => browserHarness(async (page) => {
  const zip = zipSync({ '../escape.html':strToU8('<h1>Escape</h1>') });
  const message = await page.evaluate(async (bytes) => {
    try { await window.h2f.captureFiles([new File([new Uint8Array(bytes)], 'unsafe.zip')], document.querySelector('#host')); }
    catch (error) { return error.message; }
    return null;
  }, [...zip]);
  assert.match(message, /Unsafe file path/);
}));

test('rejects extracted ZIP contents above 40 MB', async () => browserHarness(async (page) => {
  const zip = zipSync({ 'large.html':strToU8('x'.repeat(40 * 1024 * 1024 + 1)) });
  const message = await page.evaluate(async (bytes) => {
    try { await window.h2f.captureFiles([new File([new Uint8Array(bytes)], 'large.zip')], document.querySelector('#host')); }
    catch (error) { return error.message; }
    return null;
  }, [...zip]);
  assert.match(message, /40 MB/);
}));
