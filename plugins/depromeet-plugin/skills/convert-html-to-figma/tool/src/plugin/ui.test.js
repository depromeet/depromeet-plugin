import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

test('shows real page thumbnails, allows reordering, and imports without extra settings', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const ui = await readFile(join(import.meta.dirname, 'ui.html'), 'utf8');
    const red = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lH8AAAAASUVORK5CYII=';
    let body;
    await page.route('http://localhost:4179/capture', async (route) => {
      body = route.request().postDataJSON();
      assert.equal(route.request().headers()['x-h2f-token'], '__H2F_CONNECTION_TOKEN__');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        version: 1, title: 'Deck', warnings: [], pages: [
          { id: 'a', name: 'First', width: 800, height: 600, elements: [], thumbnail: red },
          { id: 'b', name: 'Second', width: 800, height: 600, elements: [], thumbnail: red }
        ]
      }) });
    });
    await page.setContent(ui);
    assert.equal(await page.locator('.step').count(), 3);
    for (const selector of ['#token', '#url', '#mode', '#selector', '#spacing']) assert.equal(await page.locator(selector).count(), 0);
    await page.locator('#files').setInputFiles({ name: 'deck.html', mimeType: 'text/html', buffer: Buffer.from('<h1>Deck</h1>') });
    await page.locator('#next').click();
    await page.locator('.page-item').first().waitFor();
    assert.equal(body.source.kind, 'files');
    assert.equal(body.source.files.length, 1);
    assert.equal(await page.locator('.page-item img[src^="data:image/png;base64,"]').count(), 2);
    await page.locator('.page-item').first().locator('[data-move="down"]').click();
    assert.equal(await page.locator('.page-item').first().locator('.page-title').textContent(), 'Second');
    await page.evaluate(() => { window.importMessage = null; window.addEventListener('message', (event) => { if (event.data.pluginMessage?.type === 'import') window.importMessage = event.data.pluginMessage; }); });
    await page.locator('#next').click();
    await page.waitForFunction(() => window.importMessage !== null);
    assert.deepEqual(await page.evaluate(() => window.importMessage.order), ['b', 'a']);
    assert.equal(await page.evaluate(() => 'spacing' in window.importMessage), false);
    assert.equal(await page.evaluate(() => window.importMessage.capture.pages[0].thumbnail), undefined);
  } finally { await browser.close(); }
});
