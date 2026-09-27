import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readOrCreateToken } from './local-auth.js';

test('creates one private connection token and reuses it for build and service', async () => {
  const root = await mkdtemp(join(tmpdir(), 'h2f-auth-'));
  try {
    const first = await readOrCreateToken(root);
    const second = await readOrCreateToken(root);
    assert.match(first, /^[a-f0-9]{64}$/);
    assert.equal(second, first);
    assert.equal(await readFile(join(root, '.local', 'connection-token'), 'utf8'), first);
    assert.equal((await stat(join(root, '.local', 'connection-token'))).mode & 0o077, 0);
  } finally { await rm(root, { recursive: true, force: true }); }
});
