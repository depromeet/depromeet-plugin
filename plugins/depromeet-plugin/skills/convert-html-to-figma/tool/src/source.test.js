import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { zipSync, strToU8 } from 'fflate';
import { prepareSource } from './source.js';

test('rejects URL input when only local HTML files and ZIPs are supported', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'h2f-test-'));
  try {
    await assert.rejects(prepareSource({ kind: 'url', url: 'https://example.com' }, dir), /files|ZIP/i);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('extracts safe HTML and assets from a zip', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'h2f-test-'));
  try {
    const zip = zipSync({ 'site/index.html': strToU8('<h1>Hi</h1>'), 'site/style.css': strToU8('h1{color:red}') });
    const result = await prepareSource({ kind: 'files', files: [{ name: 'site.zip', data: Buffer.from(zip).toString('base64') }] }, dir);
    assert.equal(result.htmlFiles.length, 1);
    assert.equal(await readFile(result.htmlFiles[0], 'utf8'), '<h1>Hi</h1>');
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('rejects zip traversal and absolute file paths', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'h2f-test-'));
  try {
    const zip = zipSync({ '../bad.html': strToU8('oops') });
    await assert.rejects(prepareSource({ kind: 'files', files: [{ name: 'bad.zip', data: Buffer.from(zip).toString('base64') }] }, dir), /path/i);
    await assert.rejects(prepareSource({ kind: 'files', files: [{ name: '/tmp/x.html', data: Buffer.from('x').toString('base64') }] }, dir), /path/i);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('rejects a zip whose declared extraction size exceeds the limit', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'h2f-test-'));
  try {
    const zip = zipSync({ 'large.html': new Uint8Array(41 * 1024 * 1024) });
    await assert.rejects(prepareSource({ kind: 'files', files: [{ name: 'large.zip', data: Buffer.from(zip).toString('base64') }] }, dir), /40 MB/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
