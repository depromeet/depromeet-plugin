# Depromeet presentation style

Use this as the only bundled visual direction. It is an independently written
presentation recipe informed by a Depromeet partnership proposal supplied by the
user. It is not an official template, and it includes no source PDF, logo, font,
photograph, screenshot, or contact information.

## Visual rhythm

Use three section modes with one shared sky-blue accent:

- **Blue:** covers, indexes, section dividers, and closing pages.
- **Light:** organization, program, schedule, metrics, and partner information.
- **Dark:** product channels, demonstrations, screenshots, and evidence.

Change modes with the narrative section rather than alternating on every page.
Content pages use a small label at the top left and a page number at the bottom
right. Covers and closing pages may use compact corner metadata instead.

## Color tokens

| Role | Value | Use |
| --- | --- | --- |
| `--brand` | `#5AAFFF` | Dividers, figures, markers, and selected controls |
| `--brand-soft` | `#80C2FF` | Lower cover gradient and quiet emphasis |
| `--on-brand` | `#FFFFFF` | Text on blue pages |
| `--canvas-light` | `#F9F9F9` | Information pages |
| `--surface` | `#E6E8EB` | Cards and explanation blocks |
| `--panel` | `#EBEFF5` | Timelines, partner grids, and large groups |
| `--canvas-dark` | `#191F28` | Demonstration pages and strong light-page headings |
| `--figure` | `#333D4B` | Large neutral values |
| `--text` | `#4E5968` | Light-page body text |
| `--text-dark` | `#F9FAFB` | Strong text on dark pages |
| `--text-dark-muted` | `#B1B8C1` | Secondary text on dark pages |

For blue orientation pages, start with
`linear-gradient(180deg, #5AAFFF, #80C2FF)`. Preserve white text on these pages
unless the user confirms another accessible pairing.

## Typography and spacing

Use this Korean-capable system stack unless the deck supplies a licensed font:

```css
font-family: "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
```

For a 1920×1080 stage, begin with:

- Cover title: 88–100 px.
- Page title: 64–72 px.
- Body: 28–34 px.
- Caption and source note: 20–24 px.
- Key figure: 88–96 px.
- Horizontal margin: about 90 px.
- Region gap: 24–32 px.
- Card padding: 40–48 px.
- Card radius: 24–32 px.

Use 700 weight for titles and 400–500 for body copy. Use 1.15–1.25 line height
for headings and 1.45–1.65 for Korean body text. Break Korean phrases at
meaningful boundaries and avoid decorative letter spacing.

## Candidate layouts

These names guide layout selection; use only the layouts required by the deck.

| Layout | Main regions |
| --- | --- |
| `proposal-cover` | metadata, headline, subtitle, contact |
| `proposal-index` | title, section groups, destination labels |
| `section-divider` | section number, title, subtopics |
| `intro-metrics` | narrative, four value cards, source note |
| `three-evidence-cards` | heading, context, three visuals |
| `program-timeline` | heading, duration, media, milestones, caveat |
| `three-initiatives` | narrative, three ordered explanation cards |
| `partner-grid` | narrative, authorized names or marks, captions |
| `channel-proof` | context, media, evidence, placement, expected effect |
| `proposal-close` | closing statement, subtitle, contact |

Start narrative and evidence pages around a 34:66 split. Start screenshot and
explanation pages around 42:58. Adjust these ratios in the skeleton when the
actual material needs more room.

## Content and asset checks

- Treat supplied claims, dates, counts, and percentages as source material, not
  automatically verified facts. Preserve denominators and qualifications.
- Do not normalize incomplete percentages or infer a missing chart category.
- Rebuild charts only from verified data and label their units.
- Use neutral media placeholders until authorized assets are available.
- A partner grid must not imply a relationship the user has not established.
- Do not reuse private screenshots from a reference presentation.
- Preserve source image aspect ratios and keep evidence labels readable.
- Use no animation by default. Any added motion must respect reduced motion.

Write the final concrete colors, fonts, spacing, selected modes, layout changes,
and approved deviations into the deck's `style-profile.md`.
