// Read-only Figma development plugin. It never mutates document nodes.
(async () => {
  figma.showUI(__html__, { width: 440, height: 250 });
  await figma.currentPage.loadAsync();

  const page = figma.currentPage;
  const allNodes = page.findAll(() => true);
  const byId = new Map(allNodes.map(node => [node.id, node]));
  const sections = allNodes.filter(node => node.type === 'SECTION');
  const selectedSection = page.selection.length === 1 && page.selection[0].type === 'SECTION'
    ? page.selection[0].id : null;

  function containingFrame(node, sectionId) {
    let current = node;
    while (current && current.parent && current.parent.id !== sectionId) {
      current = current.parent;
    }
    return current && current.type === 'FRAME' && current.parent?.id === sectionId
      ? current.id : null;
  }

  function linksFor(node, sectionId) {
    const links = [];
    for (const reaction of node.reactions || []) {
      const actions = reaction.actions || (reaction.action ? [reaction.action] : []);
      for (const action of actions) {
        if (action?.type !== 'NODE' || !action.destinationId) continue;
        links.push({
          sourceNodeId: node.id,
          sourceFrameId: containingFrame(node, sectionId),
          destinationId: action.destinationId,
          destinationFrameId: containingFrame(byId.get(action.destinationId), sectionId),
          navigation: action.navigation || null,
          trigger: reaction.trigger?.type || null
        });
      }
    }
    return links;
  }

  function inspect(section) {
    const frames = section.children.filter(node => node.type === 'FRAME');
    const frameById = new Map(frames.map(frame => [frame.id, frame]));
    const texts = new Map(frames.map(frame => [frame.id, '']));
    const links = [];

    for (const node of allNodes) {
      const frameId = containingFrame(node, section.id);
      if (!frameId || !frameById.has(frameId)) continue;
      if (node.type === 'TEXT' && node.visible !== false && node.characters) {
        const preview = texts.get(frameId);
        if (preview.length < 500) texts.set(frameId, `${preview} ${node.characters}`.trim().slice(0, 500));
      }
      links.push(...linksFor(node, section.id));
    }

    const records = frames.map(frame => ({
      id: frame.id,
      name: frame.name,
      x: frame.absoluteTransform[0][2],
      y: frame.absoluteTransform[1][2],
      width: frame.width,
      height: frame.height,
      visible: frame.visible,
      preview: texts.get(frame.id),
      links: links.filter(link => link.sourceFrameId === frame.id)
    }));
    // This is only a reading aid; verify Figma's exported PDF page order separately.
    records.sort((a, b) => Math.round(a.y / 100) - Math.round(b.y / 100) || a.x - b.x);
    const starts = page.flowStartingPoints.filter(start =>
      Boolean(containingFrame(byId.get(start.nodeId), section.id))
    );
    return {
      schemaVersion: 1,
      page: { id: page.id, name: page.name },
      section: { id: section.id, name: section.name },
      starts,
      frames: records,
      links
    };
  }

  figma.ui.onmessage = message => {
    if (message.type !== 'inspect') return;
    const section = sections.find(item => item.id === message.sectionId);
    if (!section) {
      figma.ui.postMessage({ type: 'error', message: '선택한 섹션을 찾을 수 없습니다.' });
      return;
    }
    try {
      figma.ui.postMessage({ type: 'inspection', payload: inspect(section) });
    } catch (error) {
      figma.ui.postMessage({ type: 'error', message: String(error) });
    }
  };
  figma.ui.postMessage({
    type: 'sections',
    sections: sections.map(section => ({ id: section.id, name: section.name })),
    selectedSection
  });
})();
