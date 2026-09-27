import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createCaptureServer } from './server.js';

test('requires a token and returns a capture for a file', async () => {
  const server = createCaptureServer({ token: 'test-token' });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const body = JSON.stringify({ source: { kind: 'files', files: [{ name: 'index.html', data: Buffer.from('<h1>Server works</h1>').toString('base64') }] } });
    const denied = await fetch(`${base}/capture`, { method: 'POST', headers: { 'content-type': 'application/json' }, body });
    assert.equal(denied.status, 401);
    const accepted = await fetch(`${base}/capture`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-h2f-token': 'test-token' }, body });
    assert.equal(accepted.status, 200);
    const capture = await accepted.json();
    assert.equal(capture.pages.length, 1);
    assert.ok(capture.pages[0].elements.some((item) => item.kind === 'text' && item.text === 'Server works'));
  } finally { server.close(); await once(server, 'close'); }
});
