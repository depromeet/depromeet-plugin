import { toPng } from 'html-to-image';
import { prepareBrowserFiles } from './browser-source.js';
import { validateCapture } from '../contract.js';

const VIEWPORT = { width: 1440, height: 900 };

function pageRoots(doc) {
  for (const selector of ['[data-page-id]', '[data-slide]', '.slide']) {
    const roots = [...doc.querySelectorAll(selector)];
    if (roots.length > 1) return { selector, roots };
  }
  return { selector: 'body', roots: [doc.body] };
}

function exposeRoot(win, roots, index) {
  for (const [position, node] of roots.entries()) {
    if (roots.length === 1) break;
    if (position !== index) { node.style.setProperty('display', 'none', 'important'); continue; }
    node.removeAttribute('hidden');
    node.removeAttribute('inert');
    node.style.removeProperty('display');
    if (win.getComputedStyle(node).display === 'none') node.style.setProperty('display', 'block', 'important');
    node.style.setProperty('visibility', 'visible', 'important');
    for (let parent = node.parentElement; parent; parent = parent.parentElement) {
      if (win.getComputedStyle(parent).transform !== 'none') parent.style.setProperty('transform', 'none', 'important');
    }
  }
}

async function measurePage(win, root, id, name, whole) {
  const doc = root.ownerDocument;
  const origin = root.getBoundingClientRect();
  const width = Math.max(1, Math.ceil(whole ? Math.max(doc.documentElement.scrollWidth, win.innerWidth) : origin.width));
  const height = Math.max(1, Math.ceil(whole ? Math.max(doc.documentElement.scrollHeight, win.innerHeight) : origin.height));
  const elements = [];
  const warnings = [];
  let visited = 0;
  let imageCount = 0;
  const note = (message) => { if (!warnings.includes(message)) warnings.push(message); };
  const relative = (rect) => ({ x: Math.round((rect.left - origin.left) * 100) / 100,
    y: Math.round((rect.top - origin.top) * 100) / 100,
    width: Math.round(rect.width * 100) / 100, height: Math.round(rect.height * 100) / 100 });
  async function walk(element) {
    if (visited++ > 5000) { note('Element limit reached; remaining DOM omitted'); return; }
    const style = win.getComputedStyle(element);
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
    const background = style.backgroundColor;
    const sides = ['Top', 'Right', 'Bottom', 'Left'].map((side) => ({ name:side.toLowerCase(), width:parseFloat(style[`border${side}Width`]) || 0, color:style[`border${side}Color`] }));
    const uniformBorder = sides[0].width > 0 && sides.every((side) => side.width === sides[0].width && side.color === sides[0].color);
    const hasBackground = background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent';
    if ((hasBackground && !hasBackgroundImage) || uniformBorder) elements.push({ kind:'rect', ...rect, name:label, fill:background,
      ...(uniformBorder ? { borderColor:sides[0].color, borderWidth:sides[0].width } : {}), radius:parseFloat(style.borderTopLeftRadius) || 0, opacity:Number(style.opacity) });
    if (isImage || hasBackgroundImage) {
      if (imageCount++ < 100) {
        try {
          const png = await toPng(element, { pixelRatio: 1, filter: hasBackgroundImage && !isImage ? (child) => child === element : undefined });
          elements.push({ kind: 'image', ...rect, name: label, data: png.split(',')[1] });
          note(`${label}: rasterized image or CSS background; this layer is not editable`);
        } catch { note(`${label}: image capture failed`); }
      } else note('Image limit reached; remaining images omitted');
      if (isImage) return;
    }
    if (!uniformBorder) for (const side of sides) {
      if (side.width <= 0) continue;
      const edge = side.name === 'top' ? { x:rect.x, y:rect.y, width:rect.width, height:side.width }
        : side.name === 'bottom' ? { x:rect.x, y:rect.y + rect.height - side.width, width:rect.width, height:side.width }
          : side.name === 'left' ? { x:rect.x, y:rect.y, width:side.width, height:rect.height }
            : { x:rect.x + rect.width - side.width, y:rect.y, width:side.width, height:rect.height };
      elements.push({ kind:'rect', ...edge, name:`${label}-border-${side.name}`, fill:side.color, opacity:Number(style.opacity) });
    }
    for (const child of element.childNodes) {
      if (child.nodeType === win.Node.TEXT_NODE) {
        const text = child.textContent || '';
        if (!text.trim()) continue;
        const range = doc.createRange(); range.selectNodeContents(child);
        const box = relative(range.getBoundingClientRect());
        if (box.width <= 0 || box.height <= 0) continue;
        const contentRight = rect.x + rect.width - (parseFloat(style.paddingRight) || 0);
        elements.push({ kind:'text', ...box, width:Math.max(box.width, Math.round((contentRight - box.x) * 100) / 100), name:label,
          text:text.trim(), fontFamily:style.fontFamily.split(',')[0].trim().replace(/^[\'"]|[\'"]$/g, ''),
          fontSize:parseFloat(style.fontSize) || 16, fontWeight:parseInt(style.fontWeight, 10) || 400,
          color:style.color, lineHeight:style.lineHeight === 'normal' ? null : parseFloat(style.lineHeight), textAlign:style.textAlign, opacity:Number(style.opacity),
          ...(style.display === 'inline' ? { noWrap:true } : {}) });
      } else if (child.nodeType === win.Node.ELEMENT_NODE) await walk(child);
    }
  }
  await walk(root);
  const thumbnail = await toPng(root, { pixelRatio: Math.min(1, 320 / width, 180 / height), cacheBust: false });
  return { page:{ id, name, width, height, elements, thumbnail }, warnings };
}

async function captureHtml(name, html, host) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-same-origin');
  iframe.style.cssText = `position:absolute;top:0;left:0;width:${VIEWPORT.width}px;height:${VIEWPORT.height}px;opacity:0;pointer-events:none;transform:scale(.001);transform-origin:top left;border:0`;
  host.appendChild(iframe);
  try {
    const ready = new Promise((resolve, reject) => { iframe.onload = resolve; iframe.onerror = reject; });
    iframe.srcdoc = html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
    await ready;
    const win = iframe.contentWindow;
    const doc = iframe.contentDocument;
    if (!win || !doc?.body) throw new Error('HTML preview could not be loaded');
    await doc.fonts.ready;
    const { selector, roots } = pageRoots(doc);
    const pages = [];
    const warnings = [];
    for (const [index, root] of roots.entries()) {
      exposeRoot(win, roots, index);
      const id = root.getAttribute('data-page-id') || root.getAttribute('data-slide') || `${index + 1}`.padStart(2, '0');
      const result = await measurePage(win, root, id, selector === 'body' ? name : id, selector === 'body');
      pages.push(result.page);
      warnings.push(...result.warnings.map((message) => `${result.page.name}: ${message}`));
      if (pages.length >= 100) break;
    }
    return { pages, warnings };
  } finally { iframe.remove(); }
}

export async function captureFiles(files, host) {
  const prepared = await prepareBrowserFiles(files);
  const pages = [];
  const warnings = [...prepared.warnings];
  for (const file of prepared.htmlFiles) {
    const result = await captureHtml(file.name, file.html, host);
    for (const page of result.pages) {
      page.id = pages.some((item) => item.id === page.id) ? `${pages.length + 1}-${page.id}` : page.id;
      pages.push(page);
      if (pages.length >= 100) break;
    }
    warnings.push(...result.warnings);
    if (pages.length >= 100) break;
  }
  return validateCapture({ version:1, title:prepared.title, pages, warnings });
}

window.h2f = { captureFiles };
