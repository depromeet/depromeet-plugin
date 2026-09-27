import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function readOrCreateToken(root) {
  const directory = join(root, '.local');
  const path = join(directory, 'connection-token');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  try { return (await readFile(path, 'utf8')).trim(); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const token = randomBytes(32).toString('hex');
  try { await writeFile(path, token, { mode: 0o600, flag: 'wx' }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; return (await readFile(path, 'utf8')).trim(); }
  return token;
}
