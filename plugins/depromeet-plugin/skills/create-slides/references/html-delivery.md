# HTML implementation and delivery

Read this only after the layout skeleton and complete page plan are confirmed.

## Implementation

- Prefer plain HTML with inline CSS and JavaScript so the deck needs no build step.
- Use a 1920×1080, 16:9 stage unless the user requests another ratio.
- Scale the complete stage uniformly instead of reflowing confirmed geometry.
- Use semantic slide sections, `lang`, and stable page, layout, and region IDs.
- Provide previous and next controls plus left and right arrow-key navigation.
- Keep hidden slides and their controls out of the keyboard focus order.
- Use alt text and visible keyboard focus; honor reduced-motion preferences.
- Apply the confirmed `style-profile.md` tokens and verify Korean line wrapping.
- Reproduce all confirmed copy, table cells, labels, captions, and source notes.
- Remove skeleton labels, example badges, region borders, and workflow language.

## Portability

Choose one delivery form and state it:

1. A self-contained `index.html` using embedded permitted assets and system fonts.
2. `index.html` with a local `assets/` directory containing permitted dependencies.

List external fonts or images when they cannot be bundled. Preserve source files
and keep processed assets separate.

## Browser verification

Inspect every page at 1920×1080 and a smaller desktop viewport. Also check a phone
viewport when mobile viewing is requested. Confirm:

- Page count, order, and content match `page-plan.md`.
- Text, tables, diagrams, images, and captions do not clip or overlap.
- Fonts and assets load without console errors.
- Contrast and keyboard focus remain visible.
- First and last page bounds and navigation work.
- Resize behavior preserves the approved 16:9 geometry.
- No illustrative skeleton content appears in the final deck.

Fix cosmetic defects inside the confirmed design and render again. If a fix needs
different wording, another page, omitted information, or changed region geometry,
return to the relevant review artifact first.

## Handoff

Link the final HTML, assets, skeleton, style profile, and page plan. Report page
count, controls, portability, checks, and any unverified behavior. Do not publish
or claim PDF or editable PPTX delivery unless that work was separately requested
and completed.
