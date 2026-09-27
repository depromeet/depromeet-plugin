---
name: convert-html-to-figma
description: Use when converting local HTML files or ZIP bundles into editable Figma Design frames with page thumbnails, horizontal rows, and prototype flows.
---

# Convert HTML to Figma

Use the bundled [local converter](tool/README.md). This skill starts with existing HTML; `create-slides` ends after producing HTML.

1. Inspect the user's HTML and related assets. If CSS, images, or local fonts are separate files, bundle them with the HTML in a ZIP while preserving relative paths. Do not silently substitute a screenshot for the editable import.
2. Prepare the converter once from the directory containing this file: `cd tool && npm ci && npm run build`. It runs entirely inside Figma; no capture service or connection token is needed. Rebuild after updating the plugin source. Playwright and Chromium are required only for development tests.
3. On first use, guide the person to Figma Desktop → **Plugins → Development → Import plugin from manifest** and choose `tool/manifest.json`. A published plugin ID and Community listing are not required. Without computer use, the person performs this Figma registration and subsequent plugin clicks.
4. In **HTML → Figma**, choose local `.html`, `.htm`, or `.zip` files. Review the rendered thumbnail of every detected page, adjust page order if needed, and select **새 행으로 가져오기**. A new horizontal row and a separate prototype Flow are created for each import.
5. Check the resulting frames in Figma for layout, editable text, fonts, and Flow navigation. Report any font substitution or conversion warning. A missing font requires the user to check its license and install it locally; the tool does not bundle fonts.

The converter supports local files only and detects page boundaries automatically. It does not offer page splitting, URL input, or spacing controls. It does not send the uploaded files to a local server. See the tool README for limits and known rendering differences. Do not claim that Figma registration or visual inspection happened unless it was actually observed.
