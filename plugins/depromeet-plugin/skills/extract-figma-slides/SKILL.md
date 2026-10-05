---
name: extract-figma-slides
description: Use when exporting a Figma presentation's frames as PDFs in prototype or event-running order, especially when canvas position differs from presentation order.
---

# Extract Figma Slides

The separately distributed [Figma development plugin](https://github.com/depromeet/depromeet-plugin/blob/main/tools/figma-plugins/flow-inspector/manifest.json) reads a section's frames, visible text previews, flow starts, and prototype links. It does not edit the Figma file or upload its contents. Figma's native PDF export supplies the slide artwork; the plugin JSON supplies evidence for ordering. A link graph may cover only part of a deck, so reconcile it with the timetable and the canvas before calling an export complete.

## Extract

1. Establish whether **Depromeet Flow Inspector** is installed and which source version/path is known. For first installation, updates, an unknown path, or rollback, use [setup-figma-plugins](../setup-figma-plugins/SKILL.md) and the [shared installation guide](https://github.com/depromeet/depromeet-plugin/blob/main/tools/figma-plugins/README.md). If it is already ready, continue without reinstalling. Open the target Figma Design page and run **Depromeet Flow Inspector**.
2. Select the section containing the slides, read it, and download `figma-slide-flow.json`. The JSON records direct child frames and links originating anywhere inside each frame. `destinationFrameId` resolves links to nested destination nodes where possible. The frame array's spatial order is only an aid, not a promise about PDF page order.
3. Export the page through **File → Export frames to PDF…**. Figma may include guides, alternate designs, or other frames on the page. Keep this native PDF unchanged as the source.
4. Match each intended frame to a source PDF page using its text preview, canvas position, and a rendered page. Trace prototype links from each flow start; inspect disconnected chains and unlinked frames against the event timetable. Record explicit source page numbers in a plan shaped like [the example](references/page-plan.example.json). Keep alternate drafts out of the presentation plan only when the evidence supports that choice. Do not silently omit uncertain slides.
5. From this skill directory, run the bundled builder with Poppler installed:

   ```bash
   python3 scripts/build_pdf.py --source figma-export.pdf --plan page-plan.json --output-dir output/pdf --combined-name complete-flow --dry-run
   python3 scripts/build_pdf.py --source figma-export.pdf --plan page-plan.json --output-dir output/pdf --combined-name complete-flow
   ```

6. Check `pdfinfo` page counts and render the beginning, end, and each section transition. Report which frames were excluded and why. PDF loses prototype interactions; the result is an ordered static presentation.

The script requires `pdfinfo`, `pdfseparate`, and `pdfunite`. The plan's page numbers are one-based positions in Figma's native PDF. The JSON alone cannot identify those PDF positions reliably, so never infer them from array indices without checking the export.
