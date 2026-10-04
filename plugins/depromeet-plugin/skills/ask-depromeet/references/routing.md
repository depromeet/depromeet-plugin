# Depromeet: discover, plan, confirm, execute

## Discover and clarify

Read sibling `skills/*/SKILL.md` names and descriptions as the live catalog,
excluding `ask-depromeet`. Read only plausible workflows and their required
references to check supported actions, inputs, and completion boundaries.

- A bare invocation or general request for presentation help shows the menu
  below and invites free text. Wait without inspecting files or choosing a task.
- A menu selection continues the pending request; do not repeat the menu. It
  selects an outcome and does not approve an execution plan.
- Advice-only requests end with a recommendation and an optional ready-to-use
  prompt. Do not execute the recommended workflow.
- A concrete single or composite task entering through `ask-depromeet` skips
  the menu and proceeds to planning. Even “make it now” before the plan does
  not approve that plan.
- Ask one focused question at a time only when a missing choice changes the
  result. Do not ask for supplied information or internal skill paths.

Reading supplied material and workflow instructions to scope the plan is allowed.
Producing deliverables, writing files, or querying external services for the
planned task waits for confirmation. Mark external details pending verification
when they cannot be known until execution.

If no sibling workflow covers the outcome, explain the gap and propose a plan
using available tools within the user's request.

## Present the plan

Show a concrete plan in the user's language. Keep a small plan to a few lines;
use a table for multiple steps. Include:

- Goal: the final result the user requested.
- Skills and actions: each needed skill, its role, and the action it performs.
- Sequence: dependencies and how each output feeds the next step.
- Output: format and approximate size, such as HTML slides or sectioned PDFs.
- Delivery: chat, a proposed local path, or an identified Figma document. Do not
  add file saving or external writes beyond the request.
- Participation: the review points and inputs needed from the user.

Use plain-language action labels; do not make users choose internal paths.
Use a short ASCII diagram only when dependencies or branches need explanation.
End with a clear invitation to approve or revise the plan, then wait.

## Confirm, revise, and continue

“진행해”, “좋아, 이대로”, or equivalent explicit acceptance of the presented
plan approves it. Silence, unrelated replies, menu choices, and pre-plan execution
requests do not. A correction revises the plan: show the revised plan and wait
again, unless the same message explicitly approves proceeding with that change.

After approval, execute the needed workflows in dependency order. Carry supplied
files, goals, decisions, approved artifacts, and output locations through handoffs.
Do not request reinvocation or repeat the plan approval at every step. Keep the
approved plan active across follow-up answers and routine choices within scope.
If the goal, skill action, deliverable, or destination materially changes, present
and confirm a revised plan. A failure does not authorize a substitute output or
external action outside the approved plan.

Each workflow retains its own concrete review and approval boundaries. Preserve
`create-slides` layout and content reviews and the user's confirmation before
`convert-html-to-figma` changes a Figma document. Initial plan approval does not
approve an unseen final HTML artifact or replace approval before import.

For Figma-to-PDF work, request missing Flow Inspector JSON and native Figma PDF.
Use both to prepare the page-order plan; ask about uncertain order or inclusion.
Never infer native PDF page numbers from JSON frame order.

Direct skill calls and task-bearing natural language outside `ask-depromeet`
retain their existing behavior. Do not redirect every presentation task through
this planning gate. Select only requested outcomes: HTML creation alone does
not imply Figma import, and PDF export is included only when requested.

## Menu wording

1. Create an HTML presentation from notes or source material.
2. Import existing HTML into editable Figma frames.
3. Arrange a Figma deck into sectioned or combined PDFs.

Invite the user to describe another presentation task in their own words.

## Example

User: “ask-depromeet 이 메모로 HTML 발표자료를 만들고 Figma로 옮겨줘.”

Present a plan: `create-slides` creates the HTML deck; the user reviews layout and
content; `convert-html-to-figma` imports the approved deck after import confirmation.
State the expected slide count and proposed HTML location from the supplied goal,
identify the target Figma document or clarify it, and invite approval or revision.
Do not create the deck until the user approves this plan. Once approved, continue
through the planned reviews and import without requiring another skill invocation.
