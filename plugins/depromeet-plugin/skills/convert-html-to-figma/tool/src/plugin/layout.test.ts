import test from 'node:test';
import assert from 'node:assert/strict';
import { planRow } from './layout.ts';

test('places every page left to right below existing content', () => {
  const positions = planRow([{ x: 20, y: 10, width: 200, height: 100, imported: false }], [{ width: 100, height: 60 }, { width: 120, height: 80 }], 40);
  assert.deepEqual(positions, [{ x: 20, y: 270 }, { x: 160, y: 270 }]);
});

test('aligns new row with earlier imported row while preserving vertical separation', () => {
  const positions = planRow([
    { x: -500, y: 0, width: 100, height: 100, imported: false },
    { x: 40, y: 300, width: 300, height: 200, imported: true }
  ], [{ width: 200, height: 100 }], 120);
  assert.deepEqual(positions, [{ x: 40, y: 660 }]);
});
