import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCapture } from './contract.js';

const valid = () => ({
  version: 1,
  title: 'Sample',
  pages: [{ id: 'home', name: 'Home', width: 800, height: 600, elements: [
    { kind: 'text', x: 10, y: 20, width: 100, height: 30, text: 'Hello', fontFamily: 'Inter', fontSize: 20, fontWeight: 400, color: '#000000' }
  ] }],
  warnings: []
});

test('accepts a bounded editable page', () => {
  assert.equal(validateCapture(valid()).pages[0].elements[0].text, 'Hello');
});

test('rejects invalid page dimensions and unsupported versions', () => {
  assert.throws(() => validateCapture({ ...valid(), version: 2 }), /version/i);
  const capture = valid();
  capture.pages[0].width = 0;
  assert.throws(() => validateCapture(capture), /width/i);
});

test('rejects duplicate ids and unsafe oversized input', () => {
  const capture = valid();
  capture.pages.push({ ...capture.pages[0] });
  assert.throws(() => validateCapture(capture), /duplicate/i);
  const huge = valid();
  huge.pages[0].elements[0].text = 'x'.repeat(100_001);
  assert.throws(() => validateCapture(huge), /text/i);
});

test('rejects a non-image page thumbnail before it reaches the plugin UI', () => {
  const capture = valid();
  capture.pages[0].thumbnail = 'data:text/html;base64,PHNjcmlwdD4=';
  assert.throws(() => validateCapture(capture), /thumbnail/i);
});
