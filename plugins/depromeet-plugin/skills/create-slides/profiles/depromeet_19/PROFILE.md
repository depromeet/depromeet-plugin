# depromeet_19 slide profile

This is the bundled visual profile for Depromeet 19th-generation presentations.
It combines the supplied design guide's palette and typography with a
banner-inspired slide treatment: a dark, central-object opening, dark chapter
and statement pages, and white content pages. The star field and gradients are
CSS adaptations, not official design-guide requirements. The source PDFs,
source banner and font binaries are not distributed with this skill. The
user-supplied 3D object is bundled as a reusable profile asset.
The 12 layout families are structural choices; their example copy is not deck
content or a factual claim.

## Files and ownership

- [style.css](style.css) is the source of truth for color values, font stacks,
  stage geometry, spacing, component appearance, and review-only styling.
- [layout-skeleton.html](layout-skeleton.html) is the browser-visible set of
  layout specimens and region names. It loads `style.css` beside itself.
- [assets/hero-object.png](assets/hero-object.png) is the default 3D object for
  cover and chapter pages. Copy it with the skeleton and final deck.
- [design-overview.png](design-overview.png) shows 14 page specimens: cover,
  chapter, 11 content families, and closing. It includes the current colors,
  typography, star field, and rasterized 3D examples.
- [layout-overview.png](layout-overview.png) shows the 12 layout families'
  content regions and reading order. Both images are quick references rendered
  from the HTML specimens, not separate layout specifications.
- This file defines when to use each visual mode, how to place the
  3D object, and how to adapt the source guide to slides. Do not add
  profile-specific defaults to the common workflow.
- [FONTS.md](FONTS.md) identifies the original font distributions and the
  required license, acquisition, and fallback handling for each deck.

Use the HTML skeleton as the browser-visible source of truth for all 12
families. L01 shows cover, chapter, and closing specimens. The cover and
chapter load `assets/hero-object.png` by default. Keep the image in each deck's
assets and use a relative URL that works in both the copied skeleton and final
HTML. Do not omit it when adapting those modes unless the user asks for a
different visual. The closing specimen omits the image.

When preparing a deck, copy the skeleton, stylesheet, and 3D image into its
output directory. Keep their relative links working. Select only the layouts
needed, and replace illustrative copy before review. The confirmed deck-specific
`style-profile.md` records this profile name, the chosen modes and layouts, and
any approved changes. For a self-contained final `index.html`, embed the
required rules from `style.css`; otherwise keep a local stylesheet in `assets/`.

## Color and slide modes

`style.css` contains the complete color entries visible in the supplied color
PDF: default black/white, seven blues, eleven cool grays, four transparency
styles, and three gradients. The PDF heading says 36 registered styles, while
its visible tables enumerate 27. Do not invent the other nine.

- **Cover (`L01`)**: use `--space-cover`, the centered bundled 3D object,
  and a large lower-left title. This is the profile's B composition.
- **Chapter (`L01`)**: use `--space-chapter`, move the bundled 3D object right,
  and keep the chapter title left. The closing specimen reuses the dark
  background without the object so the final statement remains primary.
- **Content (`L02`–`L05`, `L07`, `L09`–`L12`)**: white is the default stage.
  Use `--blue-800` for titles, `--blue-500` for selected emphasis, and
  `--content-panel` for quiet cards. Keep the space texture and 3D image off
  these information-dense pages. `L08` may use the pale blue tint shown in
  the specimen when a key number needs stronger separation.
- **Statement (`L06`)**: reuse the dark chapter background with no object.
  One sentence carries the page; supporting copy stays secondary.
- Keep small labels, dividers, and page numbers consistent across modes.
  The other guide gradients remain available as tokens, not mandatory fills.

Use the palette roles in the CSS instead of pasting hex values into a deck.
Check contrast in the rendered deck, especially for small labels and muted text.

## Typography

- Korean text, numbers within Korean text, and mixed Korean/English lines use
  Pretendard. This follows the Pretendard guide's explicit mixed-line rule.
- English-only text or numbers-only text use Instrument Sans via `.latin-only`.
- The Space Grotesk / Space Mono guide shows display and slogan specimens.
  This slide adaptation offers `.display-latin` for a short English display
  and `.slogan-latin` for a short slogan. Do not apply them to Korean copy.
- The supplied PDFs do not include usable font files. Follow [FONTS.md](FONTS.md)
  to obtain the fonts used by this deck, include their license notices, and
  load them locally. The CSS fallback stack remains available when acquisition
  or loading fails; disclose that fallback to the user and in the final handoff.
  Verify the rendered font, because a fallback changes line wrapping.

The PDF type sizes describe a design-system specimen, not a 1920×1080 slide.
The HTML specimens use a 106 px opening title, a 64 px standard title, body
copy around 30 px, and review-only region labels around 22 px.
Keep Korean line breaks at meaningful phrases. Test the actual deck at full
presentation size and a smaller desktop viewport.

## Geometry and candidate layouts

The profile uses a 1920×1080, 16:9 stage. Start with a 90 px stage margin,
24–30 px region gaps, and broad text/image regions. These measurements are
slide-specific choices. Change them in this profile when updating its look.
The dark specimens use three layers of small stars, a low blue glow, and thin
header and footer rules. Keep the cover halo and lower title shade, the chapter
light beam, and the closing orbit when adapting those modes. Do not add a
four-point star glyph or similar star icon as decoration. Kicker text and
page counters in the specimens are examples; replace them for each deck.

| Layout ID | Use | Main regions |
| --- | --- | --- |
| `L01` | Opening, section divider, or closing | context, hero-asset, title, subtitle, byline |
| `L02` | Explanation with visual | context, title, explanation, visual, sources |
| `L03` | Comparison | context, title, left, right, takeaway, sources |
| `L04` | Large visual with interpretation | context, title, visual, takeaway, sources |
| `L05` | Agenda or overview | title, agenda, orientation, sources |
| `L06` | Statement, question, or quotation | context, statement, support, attribution |
| `L07` | Parallel items or information cards | title, item-1 through item-3, takeaway |
| `L08` | Key metric | title, metric, baseline, takeaway, sources |
| `L09` | Process or steps | title, step-1 through step-3, takeaway, sources |
| `L10` | Timeline or roadmap | title, milestone-1 through milestone-3, takeaway, sources |
| `L11` | Relationship or hierarchy | title, parent, child-1 through child-3, legend |
| `L12` | Summary and next action | title, summary, action, ownership, sources |

Use only layouts needed for the current narrative. Preserve region names and
IDs in the confirmed skeleton and page plan. For cover and chapter pages,
record the bundled image path in the page plan and check that it loads in the
rendered deck. If the user requests an image-free cover or chapter, mark
`hero-asset` as intentionally empty. For a chapter or closing page where the
image is omitted, keep the title and byline regions; adapt proportions when
real copy needs room and review material geometry changes before final HTML.

## Content and assets

- Preserve source conditions, dates, units, denominators, and uncertainty.
- Rebuild a chart only from verified values and label its units.
- Use [assets/hero-object.png](assets/hero-object.png) for this profile's cover
  and chapter unless the user requests another visual. Record its path, crop,
  and alt text in the page plan. Copy it into the deck's assets and verify the
  final HTML resolves the path. Do not treat an image visible only in a preview
  as a delivered asset.
- Use neutral media placeholders for all other unconfirmed images.
- Keep source images at a readable aspect ratio and add meaningful alt text.
- Do not treat a source-guide screenshot, logo, or private file supplied for
  style review as an automatically distributable asset.
- Use no motion by default; any added motion must respect reduced motion.
