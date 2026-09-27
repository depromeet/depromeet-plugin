import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { prepareSource } from './source.js';
import { validateCapture } from './contract.js';

const VIEWPORT = { width: 1440, height: 900 };

async function pageRoots(page) {
  return page.evaluate(() => {
    for (const candidate of ['[data-page-id]', '[data-slide]', '.slide']) {
      const count = document.querySelectorAll(candidate).length;
      if (count > 1) return { selector: candidate, count };
    }
    return { selector: 'body', count: 1 };
  });
}

async function exposeRoot(page, selector, index) {
  return page.evaluate(({ selector, index }) => {
    const roots = [...document.querySelectorAll(selector)];
    const root = roots[index];
    if (!root) throw new Error('Page root disappeared');
    if (selector !== 'body') {
      for (const [position, item] of roots.entries()) {
        if (position === index) {
          item.removeAttribute('hidden');
          item.removeAttribute('inert');
          item.style.removeProperty('display');
          if (getComputedStyle(item).display === 'none') item.style.setProperty('display', 'block', 'important');
          item.style.setProperty('visibility', 'visible', 'important');
        } else {
          item.style.setProperty('display', 'none', 'important');
        }
      }
      for (let parent = root.parentElement; parent; parent = parent.parentElement) {
        if (getComputedStyle(parent).transform !== 'none') parent.style.setProperty('transform', 'none', 'important');
      }
    }
    return root.getAttribute('data-page-id') || root.getAttribute('data-slide') || String(index + 1).padStart(2, '0');
  }, { selector, index });
}

async function measurePage(page, selector, index, fileName, pageId) {
  const measured = await page.evaluate(({ selector, index, fileName, pageId }) => {
    const root = document.querySelectorAll(selector)[index];
    const origin = root.getBoundingClientRect();
    const whole = selector === 'body';
    const width = Math.max(1, Math.ceil(whole ? Math.max(document.documentElement.scrollWidth, innerWidth) : origin.width));
    const height = Math.max(1, Math.ceil(whole ? Math.max(document.documentElement.scrollHeight, innerHeight) : origin.height));
    const warnings = [];
    const elements = [];
    let imageCount = 0;
    let visited = 0;
    const note = (message) => { if (!warnings.includes(message)) warnings.push(message); };
    const relative = (rect) => ({
      x: Math.round((rect.left - origin.left) * 100) / 100,
      y: Math.round((rect.top - origin.top) * 100) / 100,
      width: Math.round(rect.width * 100) / 100,
      height: Math.round(rect.height * 100) / 100
    });
    function walk(element) {
      if (visited++ > 5000) { note('Element limit reached; remaining DOM omitted'); return; }
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return;
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(element.tagName)) return;
      const rect = relative(element.getBoundingClientRect());
      if (rect.width <= 0 || rect.height <= 0) return;
      const label = element.getAttribute('data-region-id') || element.id || element.tagName.toLowerCase();
      if (style.transform !== 'none') note(`${label}: CSS transform is approximated by its bounding box`);
      if (style.filter !== 'none' || style.backdropFilter !== 'none') note(`${label}: CSS filter is not editable`);
      if (style.boxShadow !== 'none') note(`${label}: box shadow is omitted`);
      const isImage = ['IMG', 'SVG', 'CANVAS', 'VIDEO'].includes(element.tagName);
      const hasBackgroundImage = style.backgroundImage !== 'none';
      if (isImage || hasBackgroundImage) {
        if (imageCount < 100) {
          const imageId = `h2f-${index}-${imageCount++}`;
          element.setAttribute('data-h2f-capture-id', imageId);
          elements.push({ kind: 'image', ...rect, name: label, imageId, backgroundOnly: hasBackgroundImage && !isImage, data: '' });
          note(`${label}: rasterized image or CSS background; this layer is not editable`);
        } else note('Image limit reached; remaining images omitted');
        if (isImage) return;
      }
      const background = style.backgroundColor;
      const sides = ['Top', 'Right', 'Bottom', 'Left'].map((side) => ({
        name: side.toLowerCase(), width: parseFloat(style[`border${side}Width`]) || 0, color: style[`border${side}Color`]
      }));
      const uniformBorder = sides[0].width > 0 && sides.every((side) => side.width === sides[0].width && side.color === sides[0].color);
      const hasBackground = background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent';
      if (hasBackground || uniformBorder) {
        elements.push({ kind: 'rect', ...rect, name: label, fill: background,
          ...(uniformBorder ? { borderColor: sides[0].color, borderWidth: sides[0].width } : {}),
          radius: parseFloat(style.borderTopLeftRadius) || 0, opacity: Number(style.opacity) });
      }
      if (!uniformBorder) {
        for (const side of sides) {
          if (side.width <= 0) continue;
          const edge = side.name === 'top' ? { x: rect.x, y: rect.y, width: rect.width, height: side.width }
            : side.name === 'bottom' ? { x: rect.x, y: rect.y + rect.height - side.width, width: rect.width, height: side.width }
              : side.name === 'left' ? { x: rect.x, y: rect.y, width: side.width, height: rect.height }
                : { x: rect.x + rect.width - side.width, y: rect.y, width: side.width, height: rect.height };
          elements.push({ kind: 'rect', ...edge, name: `${label}-border-${side.name}`, fill: side.color, opacity: Number(style.opacity) });
        }
      }
      for (const child of element.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent || '';
          if (!text.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(child);
          const box = relative(range.getBoundingClientRect());
          if (box.width <= 0 || box.height <= 0) continue;
          const contentRight = rect.x + rect.width - (parseFloat(style.paddingRight) || 0);
          const availableWidth = Math.max(box.width, Math.round((contentRight - box.x) * 100) / 100);
          elements.push({ kind: 'text', ...box, width: availableWidth, name: label, text: text.trim(), fontFamily: style.fontFamily.split(',')[0].trim().replace(/^['"]|['"]$/g, ''),
            fontSize: parseFloat(style.fontSize) || 16, fontWeight: parseInt(style.fontWeight, 10) || 400,
            color: style.color, lineHeight: style.lineHeight === 'normal' ? null : parseFloat(style.lineHeight),
            textAlign: style.textAlign, opacity: Number(style.opacity) });
        } else if (child.nodeType === Node.ELEMENT_NODE) walk(child);
      }
    }
    walk(root);
    return { page: { id: pageId, name: selector === 'body' ? fileName : (root.getAttribute('data-page-id') || root.getAttribute('data-slide') || `${fileName} ${index + 1}`), width, height, elements }, warnings };
  }, { selector, index, fileName, pageId });
  for (const element of measured.page.elements) {
    if (element.kind !== 'image') continue;
    try {
      const png = await page.locator(`[data-h2f-capture-id="${element.imageId}"]`).screenshot({ timeout: 5000,
        ...(element.backgroundOnly ? { style: `[data-h2f-capture-id="${element.imageId}"] * { visibility: hidden !important; }` } : {}) });
      element.data = png.toString('base64');
    } catch {
      measured.warnings.push(`${element.name}: image screenshot failed`);
      element.failed = true;
    }
    delete element.imageId;
    delete element.backgroundOnly;
  }
  measured.page.elements = measured.page.elements.filter((element) => !element.failed);
  return measured;
}

export async function captureSource(input, options = {}) {
  const ownTemp = !options.tempRoot;
  const tempRoot = options.tempRoot || await mkdtemp(join(tmpdir(), 'h2f-'));
  let browser;
  try {
    const prepared = await prepareSource(input, tempRoot);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: VIEWPORT, javascriptEnabled: false, deviceScaleFactor: 1 });
    const files = prepared.htmlFiles;
    const pages = [];
    const warnings = [];
    for (const file of files) {
      const page = await context.newPage();
      try {
        await page.goto(pathToFileURL(file).href, { waitUntil: 'domcontentloaded', timeout: 20_000 });
        await page.evaluate(() => document.fonts.ready);
        const roots = await pageRoots(page);
        for (let index = 0; index < roots.count; index++) {
          const id = await exposeRoot(page, roots.selector, index);
          const fileName = basename(file);
          const pageId = pages.some((existing) => existing.id === id) ? `${pages.length + 1}-${id}` : id;
          const result = await measurePage(page, roots.selector, index, fileName, pageId);
          const screenshot = await page.locator(roots.selector).nth(index).screenshot({ timeout: 10_000 });
          result.page.thumbnail = await page.evaluate(async (base64) => {
            const image = new Image();
            image.src = `data:image/png;base64,${base64}`;
            await image.decode();
            const canvas = document.createElement('canvas');
            canvas.width = 320;
            canvas.height = 180;
            const context = canvas.getContext('2d');
            context.fillStyle = '#fff';
            context.fillRect(0, 0, 320, 180);
            const scale = Math.min(320 / image.width, 180 / image.height);
            const width = image.width * scale;
            const height = image.height * scale;
            context.drawImage(image, (320 - width) / 2, (180 - height) / 2, width, height);
            return canvas.toDataURL('image/png');
          }, screenshot.toString('base64'));
          pages.push(result.page);
          warnings.push(...result.warnings.map((warning) => `${result.page.name}: ${warning}`));
          if (pages.length >= 100) break;
        }
      } finally { await page.close(); }
      if (pages.length >= 100) { warnings.push('Page limit reached at 100'); break; }
    }
    await context.close();
    return validateCapture({ version: 1, title: prepared.title, pages, warnings });
  } finally {
    if (browser) await browser.close();
    if (ownTemp) await rm(tempRoot, { recursive: true, force: true });
  }
}
