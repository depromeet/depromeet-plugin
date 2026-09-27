import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

await mkdir('dist', { recursive: true });
await build({ entryPoints: ['src/plugin/code.ts'], outfile: 'dist/code.js', bundle: true, platform: 'browser', target: 'es2020', format: 'iife' });
const ui = await readFile('src/plugin/ui.html', 'utf8');
if (!ui.includes('<!-- H2F_BROWSER_BUNDLE -->')) throw new Error('Browser bundle placeholder is missing from plugin UI');
const browser = await build({ entryPoints: ['src/plugin/browser.js'], bundle: true, platform: 'browser', target: 'es2020', format: 'iife', write: false });
await writeFile('dist/ui.html', ui.replace('<!-- H2F_BROWSER_BUNDLE -->', `<script>${browser.outputFiles[0].text}</script>`));
console.log('Built Figma plugin: dist/code.js and dist/ui.html');
