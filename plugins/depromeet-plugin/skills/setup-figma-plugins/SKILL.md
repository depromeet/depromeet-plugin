---
name: setup-figma-plugins
description: Use when installing, updating, troubleshooting registration, or rolling back the local HTML to Figma and Depromeet Flow Inspector plugins in Figma Desktop.
---

# Setup Figma Plugins

Use the shared [installation and update guide](../../figma-plugins/README.md) for both local Figma plugins. This workflow prepares the tools; it does not import HTML, edit the Figma document, or assemble PDFs.

## Entry and handoff

When called from `ask-depromeet`, continue the approved plan with the supplied
plugin, operation, known manifest path, version/source preference, destination,
and participation. Reuse its approval for the agreed installation actions; do not
ask the user to reinvoke this skill or approve the same plan again. Ask only for
missing facts needed to proceed. If the operation or destination materially
changes, return that change to the planning flow before performing it.

A direct invocation or a task-bearing request outside `ask-depromeet` follows the
user's requested installation scope without adding the router's plan gate.
Advice-only requests produce instructions without downloading or replacing files.
Installation completion does not authorize HTML import or deck extraction. For an
approved composite workflow, report setup status and resume the original task,
preserving its document-change review boundaries.

## Setup

1. Identify the requested plugin and whether this is a first install, update, missing installation path, or rollback. Reuse information already supplied. For an update, establish the currently registered manifest path before replacing files.
2. Read the relevant section of the shared guide. Check the actual GitHub Release and its assets before providing a download link or claiming a latest version. If Releases or runnable ZIPs are absent, use the documented bundled-file route and identify the checkout version separately from any installed version.
3. Explain the source, target installation folder, and files to replace. Keep the target folder stable across versions. If carrying out an authorized update, preserve a backup of the old plugin folder and unrelated user files. Extract into a temporary folder, check the manifest and its referenced files, then replace the plugin distribution files. Never remove an unknown installation to guess its location.
4. Guide Figma Desktop registration for a first install or a changed/unknown manifest path. For an update at the same registered path, close the running plugin, replace its files, and run it again. If it still loads the old copy, reimport the intended manifest and distinguish duplicate Development entries.
5. Verify that the requested plugin opens. Use packaged version metadata or a visible version only when present; manifest `api: 1.0.0` is not the release version. Report source version, observed installation path, and verification separately. Without computer-use access, state which registration and launch checks the user still needs to perform.

For rollback, select an existing previous Release or a known backup and use the same stable target folder. Do not invent a previous asset or promise an automatic update. The current plugins disable network access and have no built-in version display; this skill does not add either feature.

Example: “HTML → Figma는 설치돼 있고 업데이트하고 싶어.” Check the registered folder and available release asset, preserve the old folder, replace the distribution in that folder, then guide relaunch and verify whatever version evidence is actually available.
