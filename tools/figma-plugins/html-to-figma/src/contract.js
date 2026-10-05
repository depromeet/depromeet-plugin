const MAX_PAGES = 100;
const MAX_ELEMENTS = 5000;
const MAX_SIZE = 10000;

function positive(value, label) {
  if (!Number.isFinite(value) || value <= 0 || value > MAX_SIZE) throw new Error(`Invalid ${label}`);
}

function coordinate(value, label) {
  if (!Number.isFinite(value) || Math.abs(value) > MAX_SIZE * 2) throw new Error(`Invalid ${label}`);
}

export function validateCapture(value) {
  if (!value || typeof value !== 'object' || value.version !== 1) throw new Error('Unsupported capture version');
  if (typeof value.title !== 'string' || !value.title.trim()) throw new Error('Invalid title');
  if (!Array.isArray(value.pages) || value.pages.length < 1 || value.pages.length > MAX_PAGES) throw new Error('Invalid pages');
  if (!Array.isArray(value.warnings)) throw new Error('Invalid warnings');
  const ids = new Set();
  for (const page of value.pages) {
    if (!page || typeof page.id !== 'string' || !page.id || ids.has(page.id)) throw new Error('Invalid or duplicate page id');
    ids.add(page.id);
    if (typeof page.name !== 'string' || !page.name) throw new Error('Invalid page name');
    positive(page.width, 'width');
    positive(page.height, 'height');
    if (page.thumbnail !== undefined && (typeof page.thumbnail !== 'string' || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(page.thumbnail) || page.thumbnail.length > 500_000)) throw new Error('Invalid page thumbnail');
    if (!Array.isArray(page.elements) || page.elements.length > MAX_ELEMENTS) throw new Error('Invalid elements');
    for (const element of page.elements) {
      if (!element || !['rect', 'text', 'image'].includes(element.kind)) throw new Error('Invalid element kind');
      coordinate(element.x, 'x');
      coordinate(element.y, 'y');
      positive(element.width, 'element width');
      positive(element.height, 'element height');
      if (element.kind === 'text') {
        if (typeof element.text !== 'string' || element.text.length > 100_000) throw new Error('Invalid text');
        if (typeof element.fontFamily !== 'string' || !element.fontFamily) throw new Error('Invalid font family');
        positive(element.fontSize, 'font size');
      }
      if (element.kind === 'image' && (typeof element.data !== 'string' || element.data.length > 15_000_000)) throw new Error('Invalid image data');
    }
  }
  return value;
}
