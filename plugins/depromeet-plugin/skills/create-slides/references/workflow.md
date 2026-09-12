# Depromeet HTML slide workflow

Resolve relative paths from this file. Create presentation artifacts in the
user's chosen output directory. If none is given, choose a clear deck directory
inside the current workspace and state the path before writing.

## Delivery contract

Follow this sequence:

**brief → layout skeleton → layout confirmation → complete page plan → content
confirmation → final HTML → browser verification**

Approval applies only to the artifact the user reviewed. Approval of a layout
does not approve unshown page copy, and approval of a page plan does not authorize
publishing. Preserve previous approvals for content that has not changed.

## 1. Understand the presentation

Inspect supplied notes, documents, images, and existing output before asking for
missing information. Establish the purpose, audience, language, presentation or
reading use, approximate length, source authority, and output path. Keep supplied
files intact. When facts or metrics lack support, identify the gap instead of
inventing content.

## 2. Confirm layouts and style

Read [depromeet-style.md](depromeet-style.md) and
[review-contract.md](review-contract.md). Copy
[layout-skeleton.html](../assets/layout-skeleton.html) into the deck directory
and retain only the layouts needed for this presentation. Replace the example
labels with representative sample content while keeping it clearly marked as
illustrative.

Use the Depromeet palette and hierarchy from the start. Do not ask the user to
choose among other companies or preset catalogs. The user may still change
colors, proportions, region names, or layout choices in the skeleton. Open the
actual skeleton in a browser and obtain confirmation before planning final pages.

## 3. Confirm every page's content

Read [page-plan.md](page-plan.md) and create `page-plan.md` beside the skeleton.
Map every page to a confirmed layout and provide the exact displayed copy for
every region. Specify complete table cells, chart data and units, diagram labels,
or asset paths and crops. Mark intentionally empty regions.

After drafting, edit the page copy for clear, natural language. Compare it with
the source and preserve facts, quantities, conditions, uncertainty, terminology,
and the user's intended voice. Present the complete current page plan and obtain
confirmation before creating the final deck.

## 4. Build and verify the HTML

Read [html-delivery.md](html-delivery.md). Generate `index.html` from the confirmed
page plan, using stable page, layout, and region IDs. Inspect every page in a
browser at the presentation size and a smaller desktop size. Fix visual defects
that preserve the confirmed design. Return to the affected review stage before
changing wording, page count, region roles, or material geometry.

Deliver `index.html`, its required assets, `layout-skeleton.html`, `style-profile.md`,
and `page-plan.md`. Report the page count, controls, portability, completed checks,
and remaining limitations. Keep publication, PDF, and editable PPTX outside this
workflow unless the user requests them explicitly.
