# Depromeet workflow routing

## Choose a route

Read the names and descriptions in sibling `skills/*/SKILL.md` files when
selecting a workflow. Exclude `ask-depromeet` itself from the destination
catalog. Keep this file focused on routing behavior; do not copy the full skill
catalog here.

- A bare `ask-depromeet` request or a general request for presentation help
  shows a short menu and invites a free-text request. Do not inspect files or
  start a workflow until the user chooses.
- Advice-only requests receive a recommendation and an optional ready-to-use
  prompt. Do not execute the recommended workflow.
- A clear, single outcome routes directly to its owner without a menu or an
  extra approval step.
- An unclear outcome gets one focused question about the choice that changes
  the result.
- A request that clearly asks for multiple outcomes runs the required skills
  in dependency order. Briefly state the sequence when it helps the user follow
  progress; continue without asking the user to invoke each skill again.

## Carry work through handoffs

Pass supplied files, the user's goal, decisions, approved artifacts, and output
locations to the next workflow. Do not ask for information already provided or
repeat the same menu. Select only workflows needed for the stated outcome; for
example, creating HTML slides does not imply importing them into Figma, and PDF
export is included only when requested.

Each receiving skill keeps its own review and approval rules. In particular,
preserve the layout and content review stages in `create-slides`, and the user's
participation and confirmation before changing a Figma document in
`convert-html-to-figma`. A router handoff does not replace those checks.
When a composite request creates HTML and then imports it into Figma, finish the
HTML review and get the user's confirmation before starting the import workflow.

For Figma-to-PDF work, ask the user to provide the Flow Inspector JSON and the
native Figma PDF when they are not already available. Use both to prepare a
page-order plan. Ask about individual slides when evidence leaves their order or
inclusion unclear; never infer PDF page numbers from the JSON frame order.

If no sibling workflow covers the requested outcome, explain the gap and use
available tools only within the user's request.

## Menu wording

Use plain-language outcomes rather than skill or file paths:

1. Create an HTML presentation from notes or source material.
2. Import existing HTML into editable Figma frames.
3. Arrange a Figma deck into sectioned or combined PDFs.

Invite the user to describe a different presentation task in their own words.

## Examples

- “Depromeet 발표 작업 도와줘.” → show the menu; do not select a default.
- “이 Figma 덱을 발표 순서 PDF로 만들어줘.” → route to
  `extract-figma-slides` and request missing source files.
- “이 메모로 HTML 발표자료를 만들고, 확인한 다음 Figma로 옮겨줘.” → run
  `create-slides`, complete its layout and content reviews, get confirmation on
  the finished HTML, then hand it to `convert-html-to-figma`.
