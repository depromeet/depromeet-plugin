import { unzipSync } from 'fflate';

const MAX_BYTES = 40 * 1024 * 1024;
const MIME = { css:'text/css', png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', gif:'image/gif', svg:'image/svg+xml', webp:'image/webp', ttf:'font/ttf', otf:'font/otf', woff:'font/woff', woff2:'font/woff2' };

function safeName(name) {
  if (typeof name !== 'string' || !name || name.startsWith('/') || name.includes('\\') || /^[a-z][a-z\d+.-]*:/i.test(name)) throw new Error('Unsafe file path');
  const parts = [];
  for (const part of name.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') { if (!parts.length) throw new Error('Unsafe file path'); parts.pop(); }
    else parts.push(part);
  }
  if (!parts.length) throw new Error('Unsafe file path');
  return parts.join('/');
}

function resolveRef(base, reference) {
  const raw = reference.trim().replace(/^['"]|['"]$/g, '');
  if (/^(data:|blob:|#)/i.test(raw)) return { direct:raw };
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(raw)) return { external:raw };
  const path = raw.split(/[?#]/)[0];
  if (!path) return { direct:raw };
  return { path:safeName(`${base.slice(0, base.lastIndexOf('/') + 1)}${decodeURIComponent(path)}`) };
}

function dataUrl(path, bytes) {
  const extension = path.split('.').pop().toLowerCase();
  const mime = MIME[extension] || 'application/octet-stream';
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return `data:${mime};base64,${btoa(binary)}`;
}

async function replaceAsync(input, expression, replacer) {
  const matches = [...input.matchAll(expression)];
  const replacements = await Promise.all(matches.map((match) => replacer(...match)));
  let output = input;
  for (let index = matches.length - 1; index >= 0; index--) {
    const match = matches[index];
    output = output.slice(0, match.index) + replacements[index] + output.slice(match.index + match[0].length);
  }
  return output;
}

export async function prepareBrowserFiles(files) {
  if (!Array.isArray(files) || files.length < 1 || files.length > 100) throw new Error('Only HTML files and ZIPs are supported');
  const contents = new Map();
  let total = 0;
  for (const file of files) {
    const name = safeName(file.name);
    if (!/\.(html?|zip)$/i.test(name)) throw new Error('Only HTML files and ZIPs are supported');
    const bytes = new Uint8Array(await file.arrayBuffer());
    total += bytes.length;
    if (total > MAX_BYTES) throw new Error('Files exceed 40 MB');
    if (/\.zip$/i.test(name)) {
      const extracted = unzipSync(bytes, { filter(entry) {
        if (entry.name.endsWith('/')) return false;
        safeName(entry.name);
        total += entry.originalSize;
        if (total > MAX_BYTES) throw new Error('Extracted files exceed 40 MB');
        return true;
      } });
      for (const [path, data] of Object.entries(extracted)) contents.set(safeName(path), data);
    } else contents.set(name, bytes);
  }
  const htmlNames = [...contents.keys()].filter((name) => /\.html?$/i.test(name)).sort((a,b) => a.localeCompare(b, undefined, {numeric:true}));
  if (!htmlNames.length) throw new Error('No HTML file found');
  const warnings = [];
  const warning = (message) => { if (!warnings.includes(message)) warnings.push(message); };
  const textDecoder = new TextDecoder();
  const cachedUrls = new Map();
  function assetUrl(base, reference) {
    let ref;
    try { ref = resolveRef(base, reference); }
    catch { warning(`${base}: unsafe asset path ${reference}`); return ''; }
    if (ref.direct) return ref.direct;
    if (ref.external) { warning(`${base}: external asset omitted: ${ref.external}`); return ''; }
    const bytes = contents.get(ref.path);
    if (!bytes) { warning(`${base}: missing asset ${reference}`); return ''; }
    if (!cachedUrls.has(ref.path)) cachedUrls.set(ref.path, dataUrl(ref.path, bytes));
    return cachedUrls.get(ref.path);
  }
  async function cssUrls(css, base, seen = new Set()) {
    let output = await replaceAsync(css, /@import\s+(?:url\()?\s*['"]?([^'"\s);]+)['"]?\s*\)?\s*;/gi, async (match, reference) => {
      const ref = resolveRef(base, reference);
      if (!ref.path || !contents.has(ref.path) || seen.has(ref.path)) { warning(`${base}: CSS import omitted: ${reference}`); return ''; }
      seen.add(ref.path);
      return cssUrls(textDecoder.decode(contents.get(ref.path)), ref.path, seen);
    });
    output = await replaceAsync(output, /url\(\s*(['"]?)(.*?)\1\s*\)/gi, async (_match, _quote, reference) => {
      const url = assetUrl(base, reference);
      return url ? `url("${url}")` : 'none';
    });
    return output;
  }
  const htmlFiles = [];
  for (const name of htmlNames) {
    const doc = new DOMParser().parseFromString(textDecoder.decode(contents.get(name)), 'text/html');
    for (const node of doc.querySelectorAll('script,base,iframe,object,embed')) node.remove();
    for (const node of doc.querySelectorAll('link:not([rel~="stylesheet"]),meta[http-equiv]')) node.remove();
    for (const link of doc.querySelectorAll('link[rel~="stylesheet"]')) {
      const href = link.getAttribute('href') || '';
      const ref = resolveRef(name, href);
      const style = doc.createElement('style');
      if (ref.path && contents.has(ref.path)) style.textContent = await cssUrls(textDecoder.decode(contents.get(ref.path)), ref.path);
      else warning(`${name}: stylesheet omitted: ${href}`);
      link.replaceWith(style);
    }
    for (const style of doc.querySelectorAll('style')) style.textContent = await cssUrls(style.textContent || '', name);
    for (const node of doc.querySelectorAll('[style]')) node.setAttribute('style', await cssUrls(node.getAttribute('style') || '', name));
    for (const node of doc.querySelectorAll('[src],[poster],image[href],image[xlink\\:href]')) {
      for (const attribute of ['src','poster','href','xlink:href']) {
        if (!node.hasAttribute(attribute)) continue;
        const url = assetUrl(name, node.getAttribute(attribute));
        if (url) node.setAttribute(attribute, url); else node.removeAttribute(attribute);
      }
    }
    for (const node of doc.querySelectorAll('[srcset]')) { node.removeAttribute('srcset'); warning(`${name}: srcset omitted`); }
    const policy = doc.createElement('meta');
    policy.setAttribute('http-equiv', 'Content-Security-Policy');
    policy.setAttribute('content', "default-src 'none'; img-src data: blob:; font-src data: blob:; style-src 'unsafe-inline' data:; media-src data: blob:; script-src 'none'; connect-src 'none'; frame-src 'none'");
    doc.head.prepend(policy);
    htmlFiles.push({ name, html:`<!doctype html>${doc.documentElement.outerHTML}` });
  }
  return { htmlFiles, warnings, title:htmlNames[0].split('/').pop() };
}
