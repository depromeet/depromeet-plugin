import { validateCapture } from '../contract.js';
import { planRow } from './layout';

export const DATA_NAMESPACE = 'depromeetHtmlToFigmaRows';

interface ElementData {
  kind: 'rect' | 'text' | 'image'; name?: string; x: number; y: number; width: number; height: number;
  fill?: string; borderColor?: string; borderWidth?: number; radius?: number; opacity?: number;
  text?: string; fontFamily?: string; fontSize?: number; fontWeight?: number; color?: string;
  lineHeight?: number | null; textAlign?: string; noWrap?: boolean; data?: string;
}
interface PageData { id: string; name: string; width: number; height: number; elements: ElementData[] }
interface Capture { title: string; pages: PageData[]; warnings: string[] }

function solid(css: string | undefined): SolidPaint | null {
  if (!css || css === 'transparent') return null;
  const hex = /^#([\da-f]{6})$/i.exec(css);
  if (hex) {
    const number = Number.parseInt(hex[1], 16);
    return { type: 'SOLID', color: { r: ((number >> 16) & 255) / 255, g: ((number >> 8) & 255) / 255, b: (number & 255) / 255 } };
  }
  const rgb = /^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[, /]+([\d.]+))?\s*\)$/.exec(css);
  if (!rgb) return null;
  const opacity = rgb[4] === undefined ? 1 : Math.max(0, Math.min(1, Number(rgb[4])));
  if (opacity === 0) return null;
  return { type: 'SOLID', color: { r: Number(rgb[1]) / 255, g: Number(rgb[2]) / 255, b: Number(rgb[3]) / 255 }, opacity };
}

function bytesFromBase64(data: string): Uint8Array {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function findFont(fonts: Font[], family: string, weight: number): FontName | undefined {
  const matching = fonts.filter((font) => font.fontName.family.toLowerCase() === family.toLowerCase());
  if (!matching.length) return undefined;
  const wanted = weight >= 700 ? ['Bold', 'SemiBold', 'Regular'] : weight >= 600 ? ['SemiBold', 'Bold', 'Regular'] : ['Regular', 'Medium', 'Book'];
  for (const style of wanted) {
    const match = matching.find((font) => font.fontName.style.toLowerCase() === style.toLowerCase());
    if (match) return match.fontName;
  }
  return matching[0].fontName;
}

async function prepareFonts(api: PluginAPI, pages: PageData[], warnings: string[]) {
  const fonts = await api.listAvailableFontsAsync();
  const selected = new Map<ElementData, FontName>();
  const loaded = new Set<string>();
  for (const page of pages) for (const element of page.elements) {
    if (element.kind !== 'text') continue;
    const original = element.fontFamily || 'Inter';
    const candidates = [original, 'Noto Sans KR', 'Inter'];
    let chosen: FontName | undefined;
    for (const family of [...new Set(candidates)]) {
      const font = findFont(fonts, family, element.fontWeight || 400);
      if (!font) continue;
      const key = `${font.family}|${font.style}`;
      try {
        if (!loaded.has(key)) { await api.loadFontAsync(font); loaded.add(key); }
        chosen = font;
        break;
      } catch { /* try the next installed font */ }
    }
    if (!chosen) throw new Error(`${page.name}: no usable font for ${original}`);
    selected.set(element, chosen);
    if (chosen.family.toLowerCase() !== original.toLowerCase()) warnings.push(`${page.name} · ${element.name || 'text'}: ${original} → ${chosen.family} (${chosen.style})`);
  }
  return selected;
}

function renderElement(api: PluginAPI, frame: FrameNode, element: ElementData, font: FontName | undefined) {
  let node: RectangleNode | TextNode;
  if (element.kind === 'text') {
    const text = api.createText();
    frame.appendChild(text);
    text.fontName = font!;
    text.characters = element.text || '';
    text.fontSize = element.fontSize || 16;
    text.resize(Math.max(1, element.width + 4), Math.max(1, element.height + 4));
    text.textAutoResize = element.noWrap ? 'WIDTH_AND_HEIGHT' : 'HEIGHT';
    const fill = solid(element.color);
    text.fills = fill ? [fill] : [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    if (element.lineHeight && Number.isFinite(element.lineHeight)) text.lineHeight = { value: element.lineHeight, unit: 'PIXELS' };
    if (element.textAlign === 'center') text.textAlignHorizontal = 'CENTER';
    else if (element.textAlign === 'right') text.textAlignHorizontal = 'RIGHT';
    node = text;
  } else {
    const rect = api.createRectangle();
    frame.appendChild(rect);
    rect.resize(element.width, element.height);
    if (element.kind === 'image') {
      const image = api.createImage(bytesFromBase64(element.data || ''));
      rect.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: image.hash }];
    } else {
      const fill = solid(element.fill);
      rect.fills = fill ? [fill] : [];
      const stroke = solid(element.borderColor);
      if (stroke && (element.borderWidth || 0) > 0) {
        rect.strokes = [stroke];
        rect.strokeWeight = element.borderWidth!;
      }
      rect.cornerRadius = Math.min(element.radius || 0, element.width / 2, element.height / 2);
    }
    node = rect;
  }
  node.name = element.name || element.kind;
  node.x = element.x;
  node.y = element.y;
  if (element.opacity !== undefined) node.opacity = Math.max(0, Math.min(1, element.opacity));
}

export async function importCapture(api: PluginAPI, raw: unknown, order: string[]) {
  const capture = validateCapture(raw) as Capture;
  if (!Array.isArray(order) || order.length !== capture.pages.length || new Set(order).size !== order.length) throw new Error('Page order must include every page once');
  const byId = new Map(capture.pages.map((page) => [page.id, page]));
  const pages = order.map((id) => {
    const page = byId.get(id);
    if (!page) throw new Error(`Unknown page ${id}`);
    return page;
  });
  const warnings = [...capture.warnings];
  const fonts = await prepareFonts(api, pages, warnings);
  const existing = api.currentPage.children.map((node) => ({ x: node.x, y: node.y, width: node.width, height: node.height, imported: node.getSharedPluginData(DATA_NAMESPACE, 'h2fRow') !== '' }));
  const positions = planRow(existing, pages, 120);
  const previousStarts = [...api.currentPage.flowStartingPoints];
  const created: FrameNode[] = [];
  const rowId = `h2f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    for (const [index, page] of pages.entries()) {
      const frame = api.createFrame();
      created.push(frame);
      frame.name = page.name;
      frame.resize(page.width, page.height);
      frame.x = positions[index].x;
      frame.y = positions[index].y;
      frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      frame.clipsContent = true;
      frame.setSharedPluginData(DATA_NAMESPACE, 'h2fRow', rowId);
      frame.setSharedPluginData(DATA_NAMESPACE, 'h2fPageId', page.id);
      for (const element of page.elements) renderElement(api, frame, element, fonts.get(element));
    }
    for (let index = 0; index < created.length - 1; index++) {
      await created[index].setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'NODE', destinationId: created[index + 1].id, navigation: 'NAVIGATE', transition: null }] }]);
      const action = created[index].reactions[0]?.actions?.[0];
      if (action?.type !== 'NODE' || action.destinationId !== created[index + 1].id) throw new Error(`${pages[index].name}: prototype connection was not saved`);
    }
    api.currentPage.flowStartingPoints = [{ nodeId: created[0].id, name: capture.title }, ...previousStarts];
    api.currentPage.selection = created;
    api.viewport.scrollAndZoomIntoView(created);
    return { frameIds: created.map((frame) => frame.id), connections: Math.max(0, created.length - 1), warnings, rowId };
  } catch (error) {
    api.currentPage.flowStartingPoints = previousStarts;
    for (const frame of created) frame.remove();
    throw error;
  }
}
