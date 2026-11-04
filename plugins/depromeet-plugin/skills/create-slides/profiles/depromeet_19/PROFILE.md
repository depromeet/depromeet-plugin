# depromeet_19 slide profile

This is the bundled visual profile for Depromeet 19th-generation presentations.
Its design source of truth is the 19th PPT template in Figma: the template
rules, the PPT components, the template slides prepared for AI use, and the
19th OT deck built from them. The written "디프만 19기 PPT 제작 규칙" supplies the
working rules. When the two disagree on style, follow the Figma template.
Values in this profile were read from the Figma file, not estimated. The
Figma source, the written rules, and font binaries are not distributed with
this skill. The cover images, wordmark, icons, and the 3D object were exported
from the template and are bundled as reusable profile assets.
The 12 layout families are structural choices; their example copy is not deck
content or a factual claim.

## Files and ownership

- [style.css](style.css) is the source of truth for color values, spacing
  variables, font stacks, stage geometry, component appearance, and
  review-only styling. Its `ppt-*` classes are the PPT components.
- [examples/](examples/) holds gold examples: HTML recreations of every
  template slide, two OT pages, and the component sheet. See
  [Gold examples](#gold-examples).
- [layout-skeleton.html](layout-skeleton.html) is the browser-visible set of
  layout specimens and region names. It loads `style.css` beside itself.
- [assets/](assets/) holds the cover layers (`cover-stars.jpg`,
  `cover-planet.jpg`, `wordmark-depro.svg`, `wordmark-meet.svg`,
  `cover-glow-*.svg`), the 3D object `hero-object.png` (1086×1620,
  transparent), and template icons in `assets/icons/`.
- [design-overview.png](design-overview.png) shows the 24 gold examples.
- [layout-overview.png](layout-overview.png) shows the 12 layout families'
  content regions and reading order. Both images are rendered from the HTML,
  not separate specifications.
- This file defines when to use each visual mode and component, and how to
  adapt the template rules to HTML slides. Do not add profile-specific
  defaults to the common workflow.
- [FONTS.md](FONTS.md) identifies the original font distributions and the
  required license, acquisition, and fallback handling for each deck.

When preparing a deck, copy the skeleton, stylesheet, `assets/`, and the gold
examples you use into its output directory. Keep their relative links working.
Select only the layouts needed, and replace illustrative copy before review.
The confirmed deck-specific `style-profile.md` records this profile name, the
chosen modes, layouts, and examples, and any approved changes. For a
self-contained final `index.html`, embed the required rules from `style.css`;
otherwise keep a local stylesheet in `assets/`.

## Gold examples

Build each page from the closest gold example, not from a description:

1. Pick the example for the page's layout from the table below.
2. Copy its markup. Keep its stage size, positions, gaps, type sizes, colors,
   and component classes.
3. Replace only the copy, and images in photo shapes. Keep the header text
   `DPM 19 | 섹션명` (the templates show `Team N | 팀명` for team decks).
4. If the content does not fit, follow the spacing and card rules below
   instead of inventing new values. Report any value you had to change.

Template slides show "이미지를 첨부해 주세요" hint text where a photo belongs.
In a deck, replace the hint with a `ppt-photo` shape and keep the photo rule.
New chips use `PPT/chip` (`--main-blue`); the Blue/300 chips inside older
template slides stay as recorded in their examples.

| Example | Figma node | Use for |
| --- | --- | --- |
| `e00-cover` | 685:7447 | `L01` cover |
| `e01-title-center` | 685:6988 | `L01` chapter or closing, `L06` statement |
| `e02-keyword-list` | 685:6998 | `L05` overview, `L06` support (WHO · HOW · WHAT) |
| `e03-inline-chips` | 685:7155 | `L06` sentence with highlighted words |
| `e04-summary` | 685:7145 | `L06` or `L12` two-line summary |
| `e05-keyword-cloud` | 685:6943 | `L07` loose keywords |
| `e06-image-stage` | 685:7033 | `L04` one large visual |
| `e07-two-cards` | 685:6911 | `L03` comparison |
| `e08-two-boxes` | 685:6965 | `L03` comparison with named sides |
| `e09-three-cards` | 685:6926 | `L07` three parallel items |
| `e10-steps` | 685:7368 | `L09` process with results |
| `e11-circles-dark-bar` | 685:7198 | `L11` grouped items, `L12` summary bar |
| `e12-label-rows` | 685:7320 | `L05` agenda, `L12` labelled summary |
| `e13-feature-cards` | 685:7045 | `L07` items with images |
| `e14-feature-cards-tall` | 685:7074 | `L07` when cards carry the message |
| `e15-captioned-images` | 685:7100 | `L04` or `L07` three images |
| `e16-title-image` | 685:7021 | `L02` explanation with visual, deck title page |
| `e17-title-free` | 685:7404, 685:7437 | start for a new content type |
| `e18-header-cards` | 685:7117 | `L07` or `L09` named columns |
| `e19-tab-cards` | 685:7284 | `L07` or `L11` category tabs |
| `e20-panels-notes` | 685:7251 | `L03` comparison with conclusions |
| `e21-chip-photo-2` | 685:7414, 680:6891 | `L02` or `L03` two images (template "24번") |
| `ot01-schedule` | 685:7995, 680:6901 | `L10` week-row schedule |
| `ot02-number-cards` | 685:7495, 680:6888 | `L08` key metrics |
| `c00-components` | 685:8253 | component catalog, not a page |

## Color and slide modes

`style.css` keeps the 27 color entries visible in the original color guide:
default black/white, seven blues, eleven cool grays, four transparency styles,
and three gradients. Do not invent the nine styles the guide heading mentions
but does not list. The PPT template adds `--darknavy` (#040C23) for titles and
numbers, `--main-blue` (#5AAFFF) for chips and number-card labels,
`--blue-grey-800` (#333E4C) for dark bars, `--template-gray-400` for keyword
chips, `--ink-800` and `--ink-600` for left titles and panel labels, and
surface tokens: `--slide-bg` (#FBFEFF), `--card-tint` (Blue/300 at 10 %),
`--card-component` (component cards), `--card-ot` (schedule card), and
`--photo-fill`. Use these tokens; never paste hex values into a deck.

- **Cover (`L01`)**: `e00-cover`, exactly as the template cover proposal: a
  black-to-navy gradient, the star layer (color dodge), the planet layer
  (lighten), the Depromeet wordmark as the cover title, Space Mono Italic role
  tags, the 3D object at x 615 / width 724, and the glow layers. The cover has
  no header, subtitle, or byline. Put a deck title on the next page with
  `e16-title-image`, as the OT deck does.
- **Chapter and closing (`L01`)**: `e01-title-center`. Header, an optional
  50 px label, and an 80 px title at the vertical center. `hero-asset`,
  `subtitle`, and `byline` stay empty.
- **Content (`L02`–`L05`, `L07`–`L12`)**: `--slide-bg` stage, header, a 35 px
  Blue/300 label above an 80 px title (left-aligned variant: 58 px
  `--ink-800`), and cards from the examples.
- **Statement (`L06`)**: light and centered (`e01`, `e03`, `e04`).
- Gradients and logo images appear only on the cover.

Check contrast in the rendered deck. The template's white chip text on
`--main-blue` (about 2.3:1) and the `--main-blue` number-card label on its
card (about 2.0:1) are below WCAG AA. Keep them to short labels at their
template sizes, never put information only there, and mention the limitation
when a deck must meet an accessibility requirement.

## Typography

- Korean text, numbers within Korean text, and mixed Korean/English lines use
  Pretendard.
- English-only text or numbers-only text use Instrument Sans via `.latin-only`:
  `DPM 19` and `Team N` in the header, English labels, badges, and numbers.
- The template uses Regular, Medium, SemiBold, and Bold, plus ExtraBold for the
  dark-bar title (`e11`). Follow the example for each element.
- Letter spacing is −2 % unless the example sets another value.
- Write English titles in title case (Product Design), not all caps. Keep
  acronyms such as DPM, OT, iOS, WEB, UT, AI, MVP, and IT in capitals.
- Titles: Korean 80 px, English-only 92 px. Label 35 px Bold, 10 px above the
  title. Title-only pages: label 50 px, 30 px gap.
- Body copy is at most 32 px; 33 px or larger is a subtitle. Footnotes are
  Pretendard Medium 28 px in `--gray-600`, centered at y 950.
- Exceptions: Space Mono Italic for the cover role tags (`.slogan-latin`),
  Helvetica Neue Medium for the `DPM` mark at the right of the header, and
  SUIT Bold in the `e20` dark notes.
- The supplied guides do not include usable font files. Follow
  [FONTS.md](FONTS.md) to obtain the fonts used by this deck, include their
  license notices, and load them locally. The CSS fallback stack remains
  available when acquisition or loading fails; disclose that fallback to the
  user and in the final handoff. Verify the rendered font, because a fallback
  changes line wrapping.

Keep Korean line breaks at meaningful phrases. Test the actual deck at full
presentation size and a smaller desktop viewport.

## Geometry and spacing

The profile uses a 1920×1080, 16:9 stage. The CSS custom properties mirror the
template's `Spacing` variables; use them instead of new values.

- Side margin `--slide-margin-x` 80 px, bottom margin 120 px, content bottom
  near y 1000.
- Header: `--header-padding-top` 60 px, `--header-height` 100 px, 60 %
  opacity, 18 px gaps, 30 px text. The section name may not be left empty.
- Title starts at `--title-top` 135 px; content starts at `--content-top`
  400 px (480 px for 440-tall card rows), `--content-width` 1760 px,
  `--content-column-gap` 28 px.
- Three-column grids: `--column3-margin-x` 140 px, `--column3-gap` 40 px,
  columns 520 px.
- Spacing scale: 4, 8, 10, 12, 16, 18, 20, 24, 28, 30, 40, 50, 56, 60, 70,
  80, 90, 120, 140.

Spacing rules:

- Keep the gap between title and content under 180 px, and between the
  header and the first content element under 180 px (first content y < 280).
  Title-only centered pages are the exception.
- A title of 80 px or more needs at least 72 px to the content. If the gap is
  60 px or less, reduce the title from 80 px to 60 px.
- When a title is 60 px or more, keep at least 60 px to a subtitle (33 px or
  more).
- Body copy (32 px or less) directly under large text is spaced at large text
  × 20/56: 56 → 20, 60 → 20, 80 → 28, 92 → 32.
- Do not delete the label above a title on content pages; an empty label
  widens the title-to-content gap.

## Cards, chips, and photos

- Radius: cards 32 px (`--radius-card`), chips 100 px, photo shapes 24 px.
- Card padding: equal top and bottom, equal left and right, and the larger
  divided by the smaller below 1.5. Allowed values: 20, 24, 28, 30, 40, 50,
  56, 60, 70, 80, 90. Two cards use 60/50; three or more use 40/40; number
  cards use 56/80; text cards use 56/80.
- Only the outer card has a fill. Inner rows, items, and wrappers stay
  transparent.
- Card descriptions are at most two lines. If longer, reduce the title in
  4 px steps to 56 px, then shorten the card content.
- A box with a single line uses 72 px text when it fits, otherwise 48 px.
- `PPT/chip`: padding 18/28, Pretendard Bold 25 white on `--main-blue`.
  Chip + body block: 24 px gap, body line height 140 %.
- `PPT/number-card` (`ot02`): 568×440 reference, label Pretendard Bold 56,
  number Instrument Sans Bold 96 (88 in four columns), 24 px gap, centered.
  If a number does not fit, reduce it in 4 px steps.
- `PPT/photo`: gray 20 % shape, radius 24, width to height at least 1.4:1,
  filling the card. If narrower, keep the width and limit the height to
  width ÷ 1.4. Logo slots are exempt. A card that holds only an image has no
  card fill.
- `PPT/card-chip-photo`: two columns 866×669 with 60/50 padding and 36 px
  body; three columns 40/40 padding and 28 px body.
- `PPT/week-row` (`ot01`): week 24, date 30, name 30; text size to row gap
  6 : 5. Use the largest size that fits; names may wrap to two lines.

## Candidate layouts

| Layout ID | Use | Main regions |
| --- | --- | --- |
| `L01` | Opening, section divider, or closing | context, hero-asset, title, subtitle, byline |
| `L02` | Explanation with visual | context, title, explanation, visual, sources |
| `L03` | Comparison | context, title, left, right, takeaway, sources |
| `L04` | Large visual with interpretation | context, title, visual, takeaway, sources |
| `L05` | Agenda or overview | context, title, agenda, orientation, sources |
| `L06` | Statement, question, or quotation | context, statement, support, attribution |
| `L07` | Parallel items or chip + photo cards | context, title, item-1 through item-3, takeaway |
| `L08` | Key metric | context, title, metric, baseline, takeaway, sources |
| `L09` | Process or steps | context, title, step-1 through step-3, takeaway, sources |
| `L10` | Timeline, roadmap, or week-row schedule | context, title, milestone-1 through milestone-3 or schedule, takeaway, sources |
| `L11` | Relationship or hierarchy | context, title, parent, child-1 through child-3, legend |
| `L12` | Summary and next action | context, title, summary, action, ownership, sources |

Use only layouts needed for the current narrative. Preserve region names and
IDs in the confirmed skeleton and page plan. Before building a page, compare it
with pages of the same type already in the deck (gap, padding, radius, type
size, weight, line height, alignment) and match them. For a new type, start
from `e17-title-free` and PPT components, and report any value that differs,
with the reason. Record the cover asset paths in the page plan and check that
they load in the rendered deck. If the user requests an image-free cover, mark
`hero-asset` as intentionally empty.

## Content and assets

- Move the source copy as given. Do not shorten, rewrite, or add content that
  has no matching region; report it instead. Adding cards when there are too
  few is allowed, and the card rules for the new column count then apply.
- Keep phrases such as "확인 필요" exactly as written.
- Put supporting notes in the footnote style or as secondary text inside a
  card.
- Preserve source conditions, dates, units, denominators, and uncertainty.
- Rebuild a chart only from verified values and label its units.
- Use the bundled cover layers for the cover unless the user requests another
  visual. Copy `assets/` into the deck and verify that the final HTML
  resolves every path. Do not treat an image visible only in a preview as a
  delivered asset.
- Use photo shapes for all other unconfirmed images.
- Keep source images at a readable aspect ratio and add meaningful alt text.
- Do not treat a screenshot or private file supplied for style review as an
  automatically distributable asset.
- Use no motion by default; any added motion must respect reduced motion.

## Review checklist

Check every rendered page before handoff:

- The page matches its gold example except for the copy.
- The header reads `DPM 19 | 섹션명`.
- Korean and mixed lines use Pretendard; English-only and numbers-only text
  use Instrument Sans.
- Padding and gaps use the spacing variables.
- Title-to-content gaps follow the spacing rules.
- Cards have radius 32 and a padding ratio below 1.5.
- Photo shapes are at least 1.4:1.
- Inner wrappers have no fill.
- Source content was not shortened or changed, and nothing overflows.
