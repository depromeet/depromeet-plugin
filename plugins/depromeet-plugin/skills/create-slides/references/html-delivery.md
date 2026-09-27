# HTML implementation and delivery

Read this only after the layout skeleton and complete page plan are confirmed.

## Implementation

- Prefer plain HTML with inline CSS and JavaScript so the deck needs no build step.
- Use the selected profile's stage size and ratio unless the user requests another.
- Scale the complete stage uniformly instead of reflowing confirmed geometry.
- Use semantic slide sections, `lang`, and stable page, layout, and region IDs.
- Provide previous and next controls plus left and right arrow-key navigation.
- Keep hidden slides and their controls out of the keyboard focus order.
- Use alt text and visible keyboard focus; honor reduced-motion preferences.
- Apply the confirmed `style-profile.md` tokens and verify Korean line wrapping.
- Load the profile fonts from local files acquired for this deck. Include the
  matching copyright notices and complete licenses when distributing font
  files. Check the loaded font rather than relying on the CSS family name.
- Reproduce all confirmed copy, table cells, labels, captions, and source notes.
- Remove skeleton labels, example badges, region borders, and workflow language.

## Portability

Choose one delivery form and state it:

1. A self-contained `index.html` when the deck uses only system fonts and
   explicitly reports that portability or fidelity is limited.
2. `index.html` with a local `assets/` directory containing the acquired
   font files and their copyright and license notices.

List any external fonts or images when they cannot be bundled. State when a
fallback font is used, including when a font download or load failed. Preserve
source files and keep processed assets separate.

## Browser verification

Inspect every page at the profile's presentation size and a smaller desktop viewport. Also check a phone
viewport when mobile viewing is requested. Confirm:

- Page count, order, and content match `page-plan.md`.
- Text, tables, diagrams, images, and captions do not clip or overlap.
- The intended fonts and assets load without console errors; if they do not,
  identify the fallback font and verify the resulting line wrapping.
- Contrast and keyboard focus remain visible.
- First and last page bounds and navigation work.
- Resize behavior preserves the approved profile geometry.
- No illustrative skeleton content appears in the final deck.

Fix cosmetic defects inside the confirmed design and render again. If a fix needs
different wording, another page, omitted information, or changed region geometry,
return to the relevant review artifact first.

## Handoff

Link the final HTML, assets, font license notices, skeleton, style profile,
and page plan. Report page count, controls, portability, checks, and any
unverified behavior. Explicitly tell the user when a fallback font is in use.
Do not publish or claim PDF or editable PPTX delivery unless that work was
separately requested and completed.
