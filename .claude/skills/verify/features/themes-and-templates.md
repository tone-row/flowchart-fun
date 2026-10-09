# Themes and templates

The **Theme** tab edits the chart's look and layout (layout algorithm, direction, spacing, fonts, node and edge styling, custom Cytoscape CSS) and the graph re-lays-out live. The **Examples** dialog loads one of the templates in `shared/src/templates.ts`, optionally replacing the text too. Both write `meta.themeEditor` (and `meta.cytoscapeStyle`) into the document, so they persist with the chart.

## Sub-features

- `theme-direction` — Direction RIGHT/LEFT/DOWN/UP reorders the layout axis. Driven by `examples/theme-and-templates.mjs`.
- `theme-layout` — Layout select switches algorithm (dagre, klay, layered, mrtree, stress, radial, cose, breadthfirst, concentric, circle). Driven (circle) by `examples/theme-and-templates.mjs`.
- `theme-persist` — every change lands in `meta.themeEditor` in storage. Driven by `examples/theme-and-templates.mjs`.
- `template-style-only` — Examples → template → Load with "Load default content" unchecked restyles but keeps the text. Driven by `examples/theme-and-templates.mjs`.
- `template-with-content` — with "Load default content" checked, the text is replaced after an "Are you sure?" confirm. _Not yet driven._
- `theme-custom-css` — the Advanced section's custom CSS applies `.color_*`/`.shape_*` classes and variables. _Not yet driven._
- `theme-css-editor-size` — the Advanced section's Custom CSS editor grows to its content (minimum 300px) so the Theme panel is the only scroller, the mouse wheel over it scrolls the panel, and narrowing the pane rewraps it. Driven by `examples/theme-css-editor.mjs`.
- `theme-fonts-colors` — font picker, colors, node/edge sliders. _Not yet driven._

## How to get to it (user POV)

- Editor tab strip above the text: **Theme** (`data-testid="Editor Tab: Theme"`); **Document** returns to the text.
- **Examples** button in the editor action bar opens the template grid.
- On `/new` (logged in), the template grid picks the starting template.

## Driving it with drive.mjs

Preconditions:

- Healthy instance; client mode is enough.
- A small tree typed with `ff.typeDoc("Root\n  A\n    A1\n  B\n    B1")`, graph flowing along x (default theme is dagre, RIGHT).

- **Set direction.** `page.getByTestId("Editor Tab: Theme").click()`, `page.getByLabel("Direction").selectOption("DOWN")`. `ff.waitForGraph` shows `Root.y < A.y < A1.y`; storage `meta.themeEditor.direction === "DOWN"`.
- **Switch layout.** `page.getByLabel("Layout", { exact: true }).selectOption("circle")`. Storage `meta.themeEditor.layoutName === "circle"`; screenshot shows a ring.
- **Load a template, keep text.** `page.getByTestId("Editor Tab: Document").click()`, `page.getByRole("button", { name: "Examples" }).click()`, `page.getByRole("button", { name: "org-chart" }).click()`; "Load default content" is unchecked because the doc is not the default; `page.getByRole("button", { name: "Load", exact: true }).click()`. Storage `layoutName === "dagre"`, the text is unchanged, nodes flow down as large boxes.

Read metadata with `JSON.parse((await ff.storage("flowcharts.fun.sandbox")).split("=====")[1])`.

## Gotchas

- "Layout" needs `{ exact: true }`; the plain label also matches "Layout Algorithm".
- Assert layout by relative node order on an axis, not by bounding-box spread: wide nodes make a DOWN tree wider than tall.
- `cose` and `stress` are force-directed and re-randomize each render; assert membership and edges, not positions.
- Template buttons are named by the template id (the thumbnail `alt`), e.g. `org-chart`, not by a display title.
- The Custom CSS editor is `getByLabel("Custom CSS", { exact: true })`. Count rendered lines with its `.view-line` elements; Monaco only renders lines inside its own viewport, so a count below the stylesheet length means the editor is clipping.
- The pane divider is `[data-dragging] button`; drag it with `page.mouse` down, move with `steps`, up.
- monaco-editor 0.33 has no `monaco.editor.getEditors()`. To read an editor instance, hook `onDidCreateEditor` from a `page.addInitScript` setter on `window.monaco`.
- Any change here can alter rendering: also run `pnpm -F app visual` against the instance (see SKILL.md Evidence).
