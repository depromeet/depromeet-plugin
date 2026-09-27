import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { captureSource } from './capture.js';

async function withDir(fn) {
  const dir = await mkdtemp(join(tmpdir(), 'h2f-capture-'));
  try { await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

function file(name, html) {
  return { name, data: Buffer.from(html).toString('base64') };
}

test('captures a plain HTML file as one editable page', async () => withDir(async (dir) => {
  const capture = await captureSource({ kind: 'files', files: [file('page.html', '<style>body{margin:0}h1{color:rgb(20,40,60)}</style><h1>Hello page</h1>')] }, { tempRoot: dir });
  assert.equal(capture.pages.length, 1);
  assert.ok(capture.pages[0].elements.some((item) => item.kind === 'text' && item.text === 'Hello page'));
  assert.equal(capture.pages[0].width, 1440);
}));

test('keeps the text container width so a substitute font has room', async () => withDir(async (dir) => {
  const html = '<style>body{margin:0}h1{box-sizing:border-box;width:600px;padding:0 20px;margin:0;font-size:80px}</style><h1>Short title</h1>';
  const capture = await captureSource({ kind: 'files', files: [file('title.html', html)] }, { tempRoot: dir });
  const title = capture.pages[0].elements.find((item) => item.kind === 'text' && item.text === 'Short title');
  assert.equal(title.x, 20);
  assert.equal(title.width, 560);
}));

test('detects and captures hidden marked pages in order', async () => withDir(async (dir) => {
  const html = '<style>[data-page-id]{width:640px;height:360px} [hidden]{display:none}</style>' +
    '<section data-page-id="P01"><h1>First</h1></section><section data-page-id="P02" hidden><h1>Second</h1></section>';
  const capture = await captureSource({ kind: 'files', files: [file('deck.html', html)] }, { tempRoot: dir });
  assert.deepEqual(capture.pages.map((page) => page.id), ['P01', 'P02']);
  assert.ok(capture.pages[1].elements.some((item) => item.kind === 'text' && item.text === 'Second'));
  assert.equal(capture.pages[1].width, 640);
}));

test('restores flex layout when capturing the next hidden page', async () => withDir(async (dir) => {
  const html = '<style>body{margin:0}[data-page-id]{width:600px;height:400px;display:flex;flex-direction:column}h1{flex:1;display:flex;align-items:center;margin:0}[hidden]{display:none!important}</style>' +
    '<section data-page-id="P01"><h1>First</h1></section><section data-page-id="P02" hidden><h1>Second</h1></section>';
  const capture = await captureSource({ kind: 'files', files: [file('flex.html', html)] }, { tempRoot: dir });
  const first = capture.pages[0].elements.find((item) => item.kind === 'text' && item.text === 'First');
  const second = capture.pages[1].elements.find((item) => item.kind === 'text' && item.text === 'Second');
  assert.equal(second.y, first.y);
}));

test('returns a distinct rendered thumbnail for each hidden page', async () => withDir(async (dir) => {
  const html = '<style>body{margin:0}.slide{width:640px;height:360px}[hidden]{display:none!important}</style>' +
    '<section class="slide" data-page-id="red" style="background:#f00">Red</section>' +
    '<section class="slide" data-page-id="blue" style="background:#00f" hidden>Blue</section>';
  const capture = await captureSource({ kind: 'files', files: [file('slides.html', html)] }, { tempRoot: dir });
  assert.equal(capture.pages.length, 2);
  const thumbnails = capture.pages.map((page) => page.thumbnail);
  assert.ok(thumbnails.every((data) => typeof data === 'string' && /^data:image\/png;base64,/.test(data)));
  assert.notEqual(thumbnails[0], thumbnails[1]);
  const png = Buffer.from(thumbnails[0].split(',')[1], 'base64');
  assert.equal(png.readUInt32BE(16), 320);
  assert.equal(png.readUInt32BE(20), 180);
}));

test('captures a top-only border without outlining the other three edges', async () => withDir(async (dir) => {
  const html = '<style>body{margin:0}.card{width:300px;height:120px;background:#eee;border-top:10px solid #155eef}</style><div class="card">Card</div>';
  const capture = await captureSource({ kind: 'files', files: [file('border.html', html)] }, { tempRoot: dir });
  const base = capture.pages[0].elements.find((item) => item.kind === 'rect' && item.name === 'div');
  const top = capture.pages[0].elements.find((item) => item.kind === 'rect' && item.name === 'div-border-top');
  assert.equal(base.borderWidth, undefined);
  assert.deepEqual([top.x, top.y, top.width, top.height, top.fill], [0, 0, 300, 10, 'rgb(21, 94, 239)']);
}));

test('keeps multiple HTML files as separate ordered pages', async () => withDir(async (dir) => {
  const capture = await captureSource({ kind: 'files', files: [file('2.html', '<h1>Two</h1>'), file('1.html', '<h1>One</h1>')] }, { tempRoot: dir });
  assert.deepEqual(capture.pages.map((page) => page.name), ['1.html', '2.html']);
}));

test('keeps text editable over a CSS background image', async () => withDir(async (dir) => {
  const html = '<style>body{margin:0;background-image:linear-gradient(red,blue)}</style><h1>Editable title</h1>';
  const capture = await captureSource({ kind: 'files', files: [file('background.html', html)] }, { tempRoot: dir });
  assert.ok(capture.pages[0].elements.some((item) => item.kind === 'image'));
  assert.ok(capture.pages[0].elements.some((item) => item.kind === 'text' && item.text === 'Editable title'));
}));
