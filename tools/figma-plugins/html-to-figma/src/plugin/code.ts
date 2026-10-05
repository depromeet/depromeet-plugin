import { DATA_NAMESPACE, importCapture } from './import';

declare const __html__: string;

figma.showUI(__html__, { width: 760, height: 650, themeColors: true, title: 'HTML → Figma' });

function inventory() {
  const rows = new Map<string, string[]>();
  for (const node of figma.currentPage.children) {
    const row = node.getSharedPluginData(DATA_NAMESPACE, 'h2fRow');
    if (!row) continue;
    if (!rows.has(row)) rows.set(row, []);
    rows.get(row)!.push(node.name);
  }
  return [...rows.entries()].map(([id, names]) => ({ id, names }));
}

figma.ui.postMessage({ type: 'inventory', rows: inventory() });

figma.ui.onmessage = async (message: { type?: string; capture?: unknown; order?: string[] }) => {
  if (message.type === 'inventory') {
    figma.ui.postMessage({ type: 'inventory', rows: inventory() });
    return;
  }
  if (message.type !== 'import') return;
  try {
    const result = await importCapture(figma, message.capture, message.order || []);
    figma.ui.postMessage({ type: 'result', result, rows: inventory() });
  } catch (error) {
    figma.ui.postMessage({ type: 'error', error: error instanceof Error ? error.message : 'Import failed' });
  }
};
