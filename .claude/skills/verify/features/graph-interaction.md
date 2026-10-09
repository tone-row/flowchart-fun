# Graph interaction

The graph pane is interactive. Tapping a node or edge selects it and highlights the editor line that defines it, scrolling that line into view without taking focus from the graph. Double-clicking a node or edge focuses the editor with the cursor at the end of that line. Hovering highlights the line while the pointer stays on the element.

## Sub-features

- `graph-tap-reveal` — a single tap on a node or edge scrolls its line into view and keeps a `.node-selected` highlight on it until the next tap elsewhere, a tap on the background, or an edit. Focus stays on the graph. Driven by `examples/click-to-line.mjs`.
- `graph-dblclick-cursor` — a double-click focuses the editor, puts the cursor at the end of the line, and scrolls it into view. Driven by `examples/click-to-line.mjs`.
- `graph-hover-line` — hovering a node or edge adds `.node-hover` to its line. _Not yet driven._
- `graph-context-menu` — right-click a node or edge to add `.color_*`/`.shape_*` classes. _Not yet driven._
- `graph-drag-align` — drag nodes, freeze layout, align with the floating menu or the `h`/`v` hotkeys. _Not yet driven._

## How to get to it (user POV)

- The graph pane on `/`, `/u/:id` (including a read-only hosted chart), and the read-only routes `/r`, `/c`.
- Tap or double-click any node or edge. Tap empty canvas to clear the highlight.

## Driving it with drive.mjs

Preconditions:

- Healthy instance; client mode is enough for the sandbox and `/r`. A hosted chart needs full mode and `ff.login("pro")`.
- A document longer than the editor pane, so a reveal has to scroll. `examples/click-to-line.mjs` pads it with `// note` comment lines, which lengthen the text without adding nodes.

- **Tap a node.** `page.mouse.click` at the node's `renderedPosition()` plus the canvas box. `window.__cy.$(":selected")` is that node, the `.node-selected` line's text is the node's line, and `document.activeElement` is outside `.monaco-editor`.
- **Tap an edge.** Click at `edge.renderedMidpoint()`. The highlight moves to the edge's line (the target's line for an indented child).
- **Tap the background.** The `.node-selected` decoration disappears.
- **Double-click a node.** `page.mouse.dblclick` at the node. The editor has focus, the cursor sits on the line, and that line is rendered.
- **Edit.** Typing clears the highlight.
- **Read-only hosted chart.** Create a chart as pro, then `page.route("**/api/customer-info", r => r.fulfill({ json: {} }))` and reload: the chart shows "Read-only" and a tap still highlights the line with no `user_charts` PATCH.

To find the text of the highlighted line, match the decoration's parent `style.top` to a `.view-line` with the same `top`.

## Gotchas

- Cytoscape 3.31 fires `dblclick` for any two clicks within 250ms, even on different targets. A background click followed quickly by a node click runs the double-click handler and focuses the editor. Wait about 400ms between separate clicks.
- Hover also decorates the line. Move the pointer to empty canvas before you read `.node-selected`, or both classes sit on the same line.
- `revealLineInCenterIfOutsideViewport` does not scroll when the line is already visible, and cannot center the first or last lines of the document.
- The `Pro tip: Right-click any node…` banner covers the top of the canvas. Check `document.elementFromPoint` before you click a node near the top.
