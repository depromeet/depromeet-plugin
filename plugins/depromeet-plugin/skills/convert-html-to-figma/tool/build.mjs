import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { readOrCreateToken } from './src/local-auth.js';

await mkdir('dist', { recursive: true });
await build({ entryPoints: ['src/plugin/code.ts'], outfile: 'dist/code.js', bundle: true, platform: 'browser', target: 'es2020', format: 'iife' });
const token = await readOrCreateToken(process.cwd());
const ui = await readFile('src/plugin/ui.html', 'utf8');
if (!ui.includes('__H2F_CONNECTION_TOKEN__')) throw new Error('Connection token placeholder is missing from plugin UI');
await writeFile('dist/ui.html', ui.replaceAll('__H2F_CONNECTION_TOKEN__', token));
console.log('Built Figma plugin: dist/code.js and dist/ui.html');
