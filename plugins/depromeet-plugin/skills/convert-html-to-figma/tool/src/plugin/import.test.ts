import test from 'node:test';
import assert from 'node:assert/strict';
import { importCapture } from './import.ts';

function fakeFigma() {
  let id = 0;
  const children: any[] = [{ x: 0, y: 0, width: 400, height: 300, name: 'User content', getSharedPluginData: () => '' }];
  const page = { children, flowStartingPoints: [{ nodeId: 'old', name: 'Existing flow' }], selection: [] as any[] };
  function node(type: string) {
    const value: any = { id: `node-${++id}`, type, x: 0, y: 0, width: 100, height: 100, children: [], data: {},
      resize(width: number, height: number) { this.width = width; this.height = height; },
      appendChild(child: any) { this.children.push(child); },
      setPluginData() { throw new Error('A plugin ID is required for private data'); },
      getPluginData() { throw new Error('A plugin ID is required for private data'); },
      setSharedPluginData(namespace: string, key: string, val: string) { this.data[`${namespace}:${key}`] = val; },
      getSharedPluginData(namespace: string, key: string) { return this.data[`${namespace}:${key}`] || ''; },
      async setReactionsAsync(reactions: any[]) { this.reactions = reactions; },
      remove() { const index = children.indexOf(this); if (index >= 0) children.splice(index, 1); }
    };
    return value;
  }
  const api: any = { currentPage: page, viewport: { scrollAndZoomIntoView() {} },
    createFrame() { const frame = node('FRAME'); children.push(frame); return frame; },
    createRectangle() { return node('RECTANGLE'); },
    createText() { return node('TEXT'); },
    createImage() { return { hash: 'image-hash' }; },
    async listAvailableFontsAsync() { return [{ fontName: { family: 'Inter', style: 'Regular' } }]; },
    async loadFontAsync() {}
  };
  return { api, page, children };
}

const capture = { version: 1, title: 'Web pages', warnings: [], pages: [
  { id: 'one', name: 'One', width: 800, height: 600, elements: [
    { kind: 'text', name: 'heading', x: 20, y: 30, width: 200, height: 40, text: 'Hello', fontFamily: 'Missing Font', fontSize: 24, fontWeight: 400, color: 'rgb(0, 0, 0)' }
  ] },
  { id: 'two', name: 'Two', width: 800, height: 600, elements: [] }
] };

test('creates an independent horizontal row and keeps old content and flow', async () => {
  const { api, page, children } = fakeFigma();
  const result = await importCapture(api, capture, ['one', 'two']);
  assert.equal(children.length, 3);
  assert.deepEqual(children.slice(1).map((frame) => [frame.x, frame.y]), [[0, 460], [920, 460]]);
  assert.equal(page.flowStartingPoints.length, 2);
  assert.equal(page.flowStartingPoints[0].nodeId, 'old');
  assert.equal(page.flowStartingPoints[1].nodeId, children[1].id);
  assert.equal(children[1].reactions[0].actions[0].destinationId, children[2].id);
  assert.equal(children[1].children[0].characters, 'Hello');
  assert.ok(result.warnings.some((warning: string) => warning.includes('Missing Font') && warning.includes('Inter')));
  await importCapture(api, capture, ['two', 'one']);
  assert.equal(page.flowStartingPoints.length, 3);
  assert.ok(children[3].y > children[1].y);
});

test('removes only new frames if importing fails', async () => {
  const { api, page, children } = fakeFigma();
  api.createText = () => { throw new Error('Figma text failed'); };
  await assert.rejects(importCapture(api, capture, ['one', 'two']), /Figma text failed/);
  assert.equal(children.length, 1);
  assert.equal(page.flowStartingPoints.length, 1);
});
