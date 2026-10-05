---
name: convert-html-to-figma
description: Use when converting local HTML files or ZIP bundles into editable Figma Design frames with page thumbnails, horizontal rows, and prototype flows.
---

# Convert HTML to Figma

Use the separately distributed [local converter](https://github.com/depromeet/depromeet-plugin/blob/main/tools/figma-plugins/html-to-figma/README.md). This skill starts with existing HTML; `create-slides` ends after producing HTML.

1. Inspect the user's HTML and related assets. If CSS, images, or local fonts are separate files, bundle them with the HTML in a ZIP while preserving relative paths. Do not silently substitute a screenshot for the editable import.
2. The converter distribution contains `manifest.json`, `dist/code.js`, and `dist/ui.html`. Check them in the actual installation folder; users do not need Node.js, npm, a capture service, or a connection token. Building is for maintainers changing the source.
3. Establish whether **HTML → Figma** is installed and which source version/path is known. For first installation, updates, an unknown path, or rollback, use [setup-figma-plugins](../setup-figma-plugins/SKILL.md) and the [shared installation guide](https://github.com/depromeet/depromeet-plugin/blob/main/tools/figma-plugins/README.md). If it is already ready, continue without reinstalling. Without computer use, the person performs Figma registration and subsequent plugin clicks.
4. In **HTML → Figma**, choose local `.html`, `.htm`, or `.zip` files. Review the rendered thumbnail of every detected page, adjust page order if needed, and select **새 행으로 가져오기**. A new horizontal row and a separate prototype Flow are created for each import.
5. Check the resulting frames in Figma for layout, editable text, fonts, and Flow navigation. Report any font substitution or conversion warning. A missing font requires the user to check its license and install it locally; the tool does not bundle fonts.

The converter supports local files only and detects page boundaries automatically. It does not offer page splitting, URL input, or spacing controls. It does not send the uploaded files to a local server. See the tool README for limits and known rendering differences. Do not claim that Figma registration or visual inspection happened unless it was actually observed.
