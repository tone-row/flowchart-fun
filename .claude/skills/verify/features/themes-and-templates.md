# Themes and templates

The **Theme** tab edits the chart's look and layout (layout algorithm, direction, spacing, fonts, node and edge styling, custom Cytoscape CSS) and the graph re-lays-out live. The **Examples** dialog loads one of the templates in `shared/src/templates.ts`, optionally replacing the text too. Both write `meta.themeEditor` (and `meta.cytoscapeStyle`) into the document, so they persist with the chart.

## Sub-features

- `theme-direction` — Direction RIGHT/LEFT/DOWN/UP reorders the layout axis. Driven by `examples/theme-and-templates.mjs`.
- `theme-layout` — Layout select switches algorithm (dagre, klay, layered, mrtree, stress, radial, cose, breadthfirst, concentric, circle). Driven (circle) by `examples/theme-and-templates.mjs`.
- `theme-layout-container-note` — while Breadthfirst, Concentric, Circle or Radial is selected, one muted line under the Layout select reads "This layout doesn't support containers." (same color as the select's helper text); every other layout shows nothing, and no layout is hidden or disabled. The list is `layoutsWithoutContainers` in `toTheme.ts`, checked against headless layouts by `layoutsWithoutContainers.test.ts`. Driven by `examples/layout-container-note.mjs`.
- `theme-persist` — every change lands in `meta.themeEditor` in storage. Driven by `examples/theme-and-templates.mjs`.
- `template-style-only` — Examples → template → Load with "Load default content" unchecked restyles but keeps the text. Driven by `examples/theme-and-templates.mjs`.
- `template-with-content` — with "Load default content" checked, the text is replaced after an "Are you sure?" confirm. _Not yet driven._
- `theme-custom-css` — the Advanced section's custom CSS applies `.color_*`/`.shape_*` classes and variables. _Not yet driven._
- `theme-css-editor-size` — the Advanced section's Custom CSS editor is as tall as the Theme panel's visible content area (minimum 300px) and follows window resizes; on touch screens (`pointer: coarse`) it takes at most half the panel, so a swipe beside it scrolls the panel. It keeps its own scrolling, so ArrowDown, Cmd+F, and drag-select reveal lines below its viewport; the wheel scrolls the editor and hands off to the panel at the editor's top or bottom; narrowing the pane narrows it. A click, drag or tap never scrolls the panel (the caret lands where the pointer was); when a keyboard move, typing, undo or find moves the caret off the panel's visible area, the panel scrolls by the least amount that brings the caret line back with one line of margin, including after the panel was scrolled away from the focused editor. Loading a template's layout and styles via Examples leaves the panel where it was. Driven by `examples/theme-css-editor.mjs`.
- `theme-fonts-colors` — font picker, colors, node/edge sliders. The picker lists `fonts` in `lib/fonts.ts` (sans first, then the Literata serif, then the Shantell Sans hand font); each entry's `category` is `sans`, `serif` or `hand`, and `fonts.test.ts` fails if a template's `theme.fontFamily` is not `sans` (only sans fonts lead a theme). Picking Literata is driven by `examples/font-picker-serif.mjs`; colors and sliders are _not yet driven._
- `theme-css-unclosed-comment` — an unclosed `/*` typed at the end of the Custom CSS keeps the page responsive and the chart rendered; it comments out only the rest of the user's own CSS, so the built-in `.shape_*`/`.border_*`/text-size classes and the parallel-edge rule still apply (a `.shape_diamond` node stays a diamond) until it is closed. Driven by `examples/css-unclosed-comment.mjs`.

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
- **Container note.** `ff.pasteDoc` a chart with a `{ }` container, Theme tab, `select.selectOption("circle")`. `page.getByText("This layout doesn't support containers.", { exact: true })` is visible just under the select and shares the computed `color` of "Choose how nodes are automatically arranged in your flowchart"; after `selectOption("dagre")` it has count 0.
- **Load a template, keep text.** `page.getByTestId("Editor Tab: Document").click()`, `page.getByRole("button", { name: "Examples" }).click()`, `page.getByRole("button", { name: "org-chart" }).click()`; "Load default content" is unchecked because the doc is not the default; `page.getByRole("button", { name: "Load", exact: true }).click()`. Storage `layoutName === "dagre"`, the text is unchanged, nodes flow down as large boxes.

Read metadata with `JSON.parse((await ff.storage("flowcharts.fun.sandbox")).split("=====")[1])`.

## Gotchas

- "Layout" needs `{ exact: true }`; the plain label also matches "Layout Algorithm".
- The font picker popover opens below the Font Family input and does not flip, so at 1280x900 its lower entries sit below the viewport until the Theme panel is scrolled (`page.mouse.wheel` over the input first). Hover a picker entry before clicking it: the input's blur closes the popover unless the pointer has already entered it, and Playwright's instant move-and-click lands the mousedown before that hover commits.
- Cytoscape reports a node's `font-family` with quotes (`"Satoshi"`), and `window.__cy` is briefly undefined while the graph remounts after a font change.
- Assert layout by relative node order on an axis, not by bounding-box spread: wide nodes make a DOWN tree wider than tall.
- `cose` and `stress` are force-directed and re-randomize each render; assert membership and edges, not positions.
- Template buttons are named by the template id (the thumbnail `alt`), e.g. `org-chart`, not by a display title.
- The Custom CSS editor is `getByLabel("Custom CSS", { exact: true })`. Monaco renders `.view-line` elements only for lines inside its own viewport, so count them to see how many lines are on screen, not how long the stylesheet is. Read the stylesheet length from the model.
- Monaco runs with its macOS keymap in the headless browser: `Meta+ArrowUp` moves the caret to line 1, `Meta+f` opens find.
- The pane divider is `[data-dragging] button`; drag it with `page.mouse` down, move with `steps`, up.
- Monaco cancels `touchmove` over the editor, so a finger swipe on it never scrolls the panel. For a touch scenario open a separate context with `hasTouch: true, isMobile: true` (that makes `(pointer: coarse)` match) and swipe with CDP `Input.synthesizeScrollGesture`. CDP `Emulation.setTouchEmulationEnabled` on the shared drive page reverted to a fine pointer after `ff.open` in a long drive.
- Monaco focuses its textarea before it resolves a click or a tap (`TouchHandler` also cancels `touchend`, so no mouseup follows a tap). Never scroll the editor's ancestors on focus; the caret-follow keys on `onDidChangeCursorPosition` instead, whose `source` is `"mouse"` for clicks, drags and taps, `"keyboard"` for keys, `"modelChange"` for undo, and `"api"` for find. A new `value` prop on an editable editor (an Examples template load) is applied by @monaco-editor/react 4.6 through `executeEdits` with `forceMoveMarkers`, which moves the caret to the last line and reports `"modelChange"` with reason `RecoverFromMarkers`; only the read-only path's `setValue` reports `"model"` with reason `ContentFlush`. So the caret-follow also requires `editor.hasWidgetFocus()` (widget, not text, focus, so Enter in the find widget still follows). Monaco's own caret reveal renders on the next frame, so measure `getScrolledVisiblePosition` in a `requestAnimationFrame` after the event.
- monaco-editor 0.33 has no `monaco.editor.getEditors()`. To read an editor instance, hook `onDidCreateEditor` from a `page.addInitScript` setter on `window.monaco`.
- Which layouts draw containers correctly: measure, don't trust docs. A container is broken when a node outside it has its center inside the container's bounding box (`cy.nodes(":parent")` boxes vs `cy.nodes(":childless")` positions). Concentric fails on almost any container chart, Circle when the container holds most nodes, Radial when references point into a container from outside, Breadthfirst occasionally. Stress overlaps nodes even with no containers, so a covered node there is not a container problem.
- A page frozen by a synchronous loop (the pre-fix unclosed-comment hang) never answers, so a plain `await` after the freezing key waits forever. Put each keystroke's follow-up `page.evaluate` behind a `Promise.race` deadline so the drive fails at the key that froze it; the harness teardown has its own 5s deadline.
- Any change here can alter rendering: also run `pnpm -F app visual` against the instance (see SKILL.md Evidence).
