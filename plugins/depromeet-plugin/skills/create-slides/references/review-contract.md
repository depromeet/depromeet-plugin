# Layout and content review contract

The review artifacts are part of the delivered deck and remain available for
future revisions.

| Artifact | Purpose |
| --- | --- |
| `layout-skeleton.html` | Browser-visible layout specimens and region glossary |
| `style-profile.md` | Concrete Depromeet tokens and approved adaptations |
| `page-plan.md` | Complete page copy, placement, sources, and review state |
| `index.html` and optional `assets/` | Final presentation and dependencies |

## Layout skeleton

Show only layouts needed by the current narrative. Each specimen includes:

- A stable layout ID, display name, and intended use.
- Stable region IDs with visible names, roles, and reading order.
- Actual proportions, alignment, spacing, and hierarchy.
- Representative text and media footprints marked as examples.
- Optional regions and the condition under which they may be omitted.

Open the runnable HTML for review. Ask the user to confirm the region names,
roles, proportions, and Depromeet style direction. Keep review labels and region
borders out of the final presentation.

## Complete page review

After layout confirmation, show every page through the format in
[page-plan.md](page-plan.md). A title list alone is insufficient. Include exact
copy and complete visual specifications. Attach sources, conditions, dates, and
units to the claims they support. An unresolved placeholder does not count as
confirmed content.

Track the state at the top of `page-plan.md`:

| Scope | Revision | State | User confirmation |
| --- | --- | --- | --- |
| Layouts and region glossary | 1 | proposed | None yet |
| Depromeet style profile | 1 | proposed | None yet |
| Pages P01–P05 | 1 | not reviewed | None yet |

Use `proposed`, `changes requested`, or `confirmed`. Record the user's actual
response and its scope. Do not infer confirmation from silence.

## Route revisions

| Requested change | Required action |
| --- | --- |
| Rename a region | Update the glossary and affected page references |
| Change copy or a visual | Update and reconfirm the affected page plan |
| Add a region, split a page, or materially reflow | Update and reconfirm the skeleton and page plan |
| Fix clipping without changing content or geometry | Fix and render again |

Preserve confirmed, unaffected work while revising only the changed scope.
