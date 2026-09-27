export interface Box { x: number; y: number; width: number; height: number; imported: boolean }
export interface Size { width: number; height: number }

export function planRow(existing: Box[], pages: Size[], spacing: number): Array<{ x: number; y: number }> {
  if (!pages.length) throw new Error('At least one page is required');
  if (!Number.isFinite(spacing) || spacing < 0 || spacing > 1000) throw new Error('Invalid spacing');
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
