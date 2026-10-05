---
name: navigate-guide
description: Use when someone asks how to use Depromeet Plugin, needs first-time onboarding, wants the relevant usage guide, or is stuck in an installation or presentation step. Explains usage without starting artifact production.
---

# Navigate Guide

Guide the person through the maintained user documentation. Use their stated goal,
completed steps, program, and error message to choose the starting point; do not
require technical knowledge or ask again for information already supplied.

## Read the relevant guide

Documentation lives outside the installed plugin package. Use the version-pinned
public URLs below, not relative paths into a presumed repository checkout. If an
actual checkout is available and the user asks about that checkout, read its
`docs/` and manifests and state which version it represents. Explain documented
behavior separately from behavior observed in the user's environment.

- First encounter or unclear capabilities: [onboarding](https://github.com/depromeet/depromeet-plugin/blob/v0.9.0/docs/onboarding.md)
- Guide selection and the two kinds of plugin: [documentation index](https://github.com/depromeet/depromeet-plugin/blob/v0.9.0/docs/README.md)
- AI plugin installation: [install](https://github.com/depromeet/depromeet-plugin/blob/v0.9.0/docs/guides/install.md)
- Asking for guidance versus doing work: [ask for help](https://github.com/depromeet/depromeet-plugin/blob/v0.9.0/docs/guides/ask-for-help.md)
- Notes to HTML slides: [create slides](https://github.com/depromeet/depromeet-plugin/blob/v0.9.0/docs/guides/create-slides.md)
- HTML to editable Figma frames: [import](https://github.com/depromeet/depromeet-plugin/blob/v0.9.0/docs/guides/import-to-figma.md)
- Figma to ordered PDF: [export](https://github.com/depromeet/depromeet-plugin/blob/v0.9.0/docs/guides/export-pdf.md)
- Figma tool installation, updates, or registration errors: [setup](https://github.com/depromeet/depromeet-plugin/blob/v0.9.0/docs/guides/figma-setup.md)

Read only the relevant pages with an available reading tool. If no reading tool
or network is available, or retrieval fails, disclose that the guide could not
be read and provide its link or ask for the relevant passage. Do not invent
installation commands, UI controls, release availability, or successful actions.
Follow guide links when additional detail is needed. When the plugin version
changes, update these URLs to the same release tag and verify that tag's docs.

## Explain and hand off

Answer in the user's language. Begin with what the requested task achieves and
what they need now. Define essential unfamiliar terms at first use. Give the
next actions, distinguish AI actions from the person's Figma clicks, and state
what result lets them check the step. Include a copyable request when useful.

Usage questions end with guidance. Do not download, install, create slides,
import into Figma, or export PDFs solely because the person asks how. When they
explicitly request execution, continue into the relevant sibling workflow with
the supplied context and its review boundaries. Use `ask-depromeet` when they
want a reviewed execution plan; do not add its planning gate to direct requests.
