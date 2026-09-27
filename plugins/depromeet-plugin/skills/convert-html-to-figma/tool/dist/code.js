"use strict";
(() => {
  // src/contract.js
  var MAX_PAGES = 100;
  var MAX_ELEMENTS = 5e3;
  var MAX_SIZE = 1e4;
  function positive(value, label) {
    if (!Number.isFinite(value) || value <= 0 || value > MAX_SIZE) throw new Error(`Invalid ${label}`);
  }
  function coordinate(value, label) {
    if (!Number.isFinite(value) || Math.abs(value) > MAX_SIZE * 2) throw new Error(`Invalid ${label}`);
  }
  function validateCapture(value) {
    if (!value || typeof value !== "object" || value.version !== 1) throw new Error("Unsupported capture version");
    if (typeof value.title !== "string" || !value.title.trim()) throw new Error("Invalid title");
    if (!Array.isArray(value.pages) || value.pages.length < 1 || value.pages.length > MAX_PAGES) throw new Error("Invalid pages");
    if (!Array.isArray(value.warnings)) throw new Error("Invalid warnings");
    const ids = /* @__PURE__ */ new Set();
    for (const page of value.pages) {
      if (!page || typeof page.id !== "string" || !page.id || ids.has(page.id)) throw new Error("Invalid or duplicate page id");
      ids.add(page.id);
      if (typeof page.name !== "string" || !page.name) throw new Error("Invalid page name");
      positive(page.width, "width");
      positive(page.height, "height");
      if (page.thumbnail !== void 0 && (typeof page.thumbnail !== "string" || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(page.thumbnail) || page.thumbnail.length > 5e5)) throw new Error("Invalid page thumbnail");
      if (!Array.isArray(page.elements) || page.elements.length > MAX_ELEMENTS) throw new Error("Invalid elements");
      for (const element of page.elements) {
        if (!element || !["rect", "text", "image"].includes(element.kind)) throw new Error("Invalid element kind");
        coordinate(element.x, "x");
        coordinate(element.y, "y");
        positive(element.width, "element width");
        positive(element.height, "element height");
        if (element.kind === "text") {
          if (typeof element.text !== "string" || element.text.length > 1e5) throw new Error("Invalid text");
          if (typeof element.fontFamily !== "string" || !element.fontFamily) throw new Error("Invalid font family");
          positive(element.fontSize, "font size");
        }
        if (element.kind === "image" && (typeof element.data !== "string" || element.data.length > 15e6)) throw new Error("Invalid image data");
      }
    }
    return value;
  }

  // src/plugin/layout.ts
  function planRow(existing, pages, spacing) {
    if (!pages.length) throw new Error("At least one page is required");
    if (!Number.isFinite(spacing) || spacing < 0 || spacing > 1e3) throw new Error("Invalid spacing");
    const imported = existing.filter((box) => box.imported);
    const left = existing.length ? Math.min(...(imported.length ? imported : existing).map((box) => box.x)) : 0;
    const top = existing.length ? Math.max(...existing.map((box) => box.y + box.height)) + 160 : 0;
    let x = left;
    return pages.map((page) => {
      const position = { x, y: top };
      x += page.width + spacing;
      return position;
    });
  }

  // src/plugin/import.ts
  var DATA_NAMESPACE = "depromeetHtmlToFigmaRows";
  var FONT_FAMILY_ALIASES = {
    instrument: ["Instrument Sans"],
    spacegrotesk: ["Space Grotesk"],
    spacemono: ["Space Mono"]
  };
  function solid(css) {
    if (!css || css === "transparent") return null;
    const hex = /^#([\da-f]{6})$/i.exec(css);
    if (hex) {
      const number = Number.parseInt(hex[1], 16);
      return { type: "SOLID", color: { r: (number >> 16 & 255) / 255, g: (number >> 8 & 255) / 255, b: (number & 255) / 255 } };
    }
    const rgb = /^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[, /]+([\d.]+))?\s*\)$/.exec(css);
    if (!rgb) return null;
    const opacity = rgb[4] === void 0 ? 1 : Math.max(0, Math.min(1, Number(rgb[4])));
    if (opacity === 0) return null;
    return { type: "SOLID", color: { r: Number(rgb[1]) / 255, g: Number(rgb[2]) / 255, b: Number(rgb[3]) / 255 }, opacity };
  }
  function bytesFromBase64(data) {
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }
  function findFont(fonts, family, weight) {
    const matching = fonts.filter((font) => font.fontName.family.toLowerCase() === family.toLowerCase());
    if (!matching.length) return void 0;
    const wanted = weight >= 700 ? ["Bold", "SemiBold", "Regular"] : weight >= 600 ? ["SemiBold", "Bold", "Regular"] : ["Regular", "Medium", "Book"];
    for (const style of wanted) {
      const match = matching.find((font) => font.fontName.style.toLowerCase() === style.toLowerCase());
      if (match) return match.fontName;
    }
    return matching[0].fontName;
  }
  async function prepareFonts(api, pages, warnings) {
    const fonts = await api.listAvailableFontsAsync();
    const selected = /* @__PURE__ */ new Map();
    const loaded = /* @__PURE__ */ new Set();
    for (const page of pages) for (const element of page.elements) {
      if (element.kind !== "text") continue;
      const original = element.fontFamily || "Inter";
      const aliases = FONT_FAMILY_ALIASES[original.toLowerCase()] || [];
      const candidates = [original, ...aliases, "Noto Sans KR", "Inter"];
      let chosen;
      for (const family of [...new Set(candidates)]) {
        const font = findFont(fonts, family, element.fontWeight || 400);
        if (!font) continue;
        const key = `${font.family}|${font.style}`;
        try {
          if (!loaded.has(key)) {
            await api.loadFontAsync(font);
            loaded.add(key);
          }
          chosen = font;
          break;
        } catch {
        }
      }
      if (!chosen) throw new Error(`${page.name}: no usable font for ${original}`);
      selected.set(element, chosen);
      if (![original, ...aliases].some((family) => family.toLowerCase() === chosen.family.toLowerCase())) warnings.push(`${page.name} \xB7 ${element.name || "text"}: ${original} \u2192 ${chosen.family} (${chosen.style})`);
    }
    return selected;
  }
  function renderElement(api, frame, element, font) {
    let node;
    if (element.kind === "text") {
      const text = api.createText();
      frame.appendChild(text);
      text.fontName = font;
      text.characters = element.text || "";
      text.fontSize = element.fontSize || 16;
      text.resize(Math.max(1, element.width + 4), Math.max(1, element.height + 4));
      text.textAutoResize = element.noWrap && element.textAlign !== "center" && element.textAlign !== "right" ? "WIDTH_AND_HEIGHT" : "HEIGHT";
      const fill = solid(element.color);
      text.fills = fill ? [fill] : [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
      if (element.lineHeight && Number.isFinite(element.lineHeight)) text.lineHeight = { value: element.lineHeight, unit: "PIXELS" };
      if (element.textAlign === "center") text.textAlignHorizontal = "CENTER";
      else if (element.textAlign === "right") text.textAlignHorizontal = "RIGHT";
      node = text;
    } else {
      const rect = api.createRectangle();
      frame.appendChild(rect);
      rect.resize(element.width, element.height);
      if (element.kind === "image") {
        const image = api.createImage(bytesFromBase64(element.data || ""));
        rect.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: image.hash }];
      } else {
        const fill = solid(element.fill);
        rect.fills = fill ? [fill] : [];
        const stroke = solid(element.borderColor);
        if (stroke && (element.borderWidth || 0) > 0) {
          rect.strokes = [stroke];
          rect.strokeWeight = element.borderWidth;
        }
        rect.cornerRadius = Math.min(element.radius || 0, element.width / 2, element.height / 2);
      }
      node = rect;
    }
    node.name = element.name || element.kind;
    node.x = element.x;
    node.y = element.y;
    if (element.opacity !== void 0) node.opacity = Math.max(0, Math.min(1, element.opacity));
  }
  async function importCapture(api, raw, order) {
    const capture = validateCapture(raw);
    if (!Array.isArray(order) || order.length !== capture.pages.length || new Set(order).size !== order.length) throw new Error("Page order must include every page once");
    const byId = new Map(capture.pages.map((page) => [page.id, page]));
    const pages = order.map((id) => {
      const page = byId.get(id);
      if (!page) throw new Error(`Unknown page ${id}`);
      return page;
    });
    const warnings = [...capture.warnings];
    const fonts = await prepareFonts(api, pages, warnings);
    const existing = api.currentPage.children.map((node) => ({ x: node.x, y: node.y, width: node.width, height: node.height, imported: node.getSharedPluginData(DATA_NAMESPACE, "h2fRow") !== "" }));
    const positions = planRow(existing, pages, 120);
    const previousStarts = [...api.currentPage.flowStartingPoints];
    const created = [];
    const rowId = `h2f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    try {
      for (const [index, page] of pages.entries()) {
        const frame = api.createFrame();
        created.push(frame);
        frame.name = page.name;
        frame.resize(page.width, page.height);
        frame.x = positions[index].x;
        frame.y = positions[index].y;
        frame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
        frame.clipsContent = true;
        frame.setSharedPluginData(DATA_NAMESPACE, "h2fRow", rowId);
        frame.setSharedPluginData(DATA_NAMESPACE, "h2fPageId", page.id);
        for (const element of page.elements) renderElement(api, frame, element, fonts.get(element));
      }
      for (let index = 0; index < created.length - 1; index++) {
        await created[index].setReactionsAsync([{ trigger: { type: "ON_CLICK" }, actions: [{ type: "NODE", destinationId: created[index + 1].id, navigation: "NAVIGATE", transition: null }] }]);
        const action = created[index].reactions[0]?.actions?.[0];
        if (action?.type !== "NODE" || action.destinationId !== created[index + 1].id) throw new Error(`${pages[index].name}: prototype connection was not saved`);
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

  // src/plugin/code.ts
  figma.showUI(__html__, { width: 760, height: 650, themeColors: true, title: "HTML \u2192 Figma" });
  function inventory() {
    const rows = /* @__PURE__ */ new Map();
    for (const node of figma.currentPage.children) {
      const row = node.getSharedPluginData(DATA_NAMESPACE, "h2fRow");
      if (!row) continue;
      if (!rows.has(row)) rows.set(row, []);
      rows.get(row).push(node.name);
    }
    return [...rows.entries()].map(([id, names]) => ({ id, names }));
  }
  figma.ui.postMessage({ type: "inventory", rows: inventory() });
  figma.ui.onmessage = async (message) => {
    if (message.type === "inventory") {
      figma.ui.postMessage({ type: "inventory", rows: inventory() });
      return;
    }
    if (message.type !== "import") return;
    try {
      const result = await importCapture(figma, message.capture, message.order || []);
      figma.ui.postMessage({ type: "result", result, rows: inventory() });
    } catch (error) {
      figma.ui.postMessage({ type: "error", error: error instanceof Error ? error.message : "Import failed" });
    }
  };
})();
