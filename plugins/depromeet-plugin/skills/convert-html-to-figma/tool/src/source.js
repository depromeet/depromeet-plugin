import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { basename, extname, isAbsolute, join, resolve, sep } from 'node:path';
import { unzipSync } from 'fflate';

const MAX_BYTES = 40 * 1024 * 1024;

function safePath(root, name) {
  if (typeof name !== 'string' || !name || isAbsolute(name) || name.includes('\\')) throw new Error('Unsafe file path');
  const output = resolve(root, name);
  if (!output.startsWith(resolve(root) + sep)) throw new Error('Unsafe file path');
  return output;
}

async function collectHtml(root) {
  const found = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (/\.html?$/i.test(entry.name)) found.push(path);
    }
  }
  await visit(root);
  return found.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export async function prepareSource(input, root) {
  if (!input || typeof input !== 'object') throw new Error('Source is required');
  if (input.kind !== 'files' || !Array.isArray(input.files) || !input.files.length || input.files.length > 100) throw new Error('Only HTML files and ZIPs are supported');
  let total = 0;
  await mkdir(root, { recursive: true });
  for (const file of input.files) {
    if (typeof file.data !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(file.data)) throw new Error('Invalid file data');
    const bytes = Buffer.from(file.data, 'base64');
    total += bytes.length;
    if (total > MAX_BYTES) throw new Error('Files exceed 40 MB');
    const output = safePath(root, file.name);
    const extension = extname(file.name).toLowerCase();
    if (!['.zip', '.html', '.htm'].includes(extension)) throw new Error('Only HTML files and ZIPs are supported');
    if (extension === '.zip') {
      const contents = unzipSync(new Uint8Array(bytes), { filter(entry) {
        if (entry.name.endsWith('/')) return false;
        safePath(root, entry.name);
        total += entry.originalSize;
        if (total > MAX_BYTES) throw new Error('Extracted files exceed 40 MB');
        return true;
      } });
      for (const [name, data] of Object.entries(contents)) {
        const target = safePath(root, name);
        await mkdir(resolve(target, '..'), { recursive: true });
        await writeFile(target, data);
      }
    } else {
      await mkdir(resolve(output, '..'), { recursive: true });
      await writeFile(output, bytes);
    }
  }
  const htmlFiles = await collectHtml(root);
  if (!htmlFiles.length) throw new Error('No HTML file found');
  return { kind: 'files', htmlFiles, title: basename(htmlFiles[0]) };
}
