# References and containers

Beyond indentation, the DSL links nodes with references and groups them with containers. `(Label)` or `(#id)` on its own line draws an edge from the parent line to an existing node instead of creating a new one; `label: (Target)` labels that edge. A line ending in `{` opens a container whose indented lines become child nodes, and `}` closes it. Edge-to-edge pointers exist (`(#edgeId)`), but a label pointer that happens to match an edge label must never produce a drawable edge.

## Sub-features

- `ref-label-pointer` — `(Label)` under a line draws an edge to the existing node of that label; the node is not duplicated. Driven by `examples/reference-edges.mjs` (also `examples/sandbox-edit.mjs` via `(Ship it?)`).
- `ref-node-only-edges` — when an edge label equals a referenced node label (`null: Apply` next to `fail: (null)`), every rendered edge still has node endpoints, so dragging the target carries all incoming edges with it. Driven by `examples/reference-edges.mjs`.
- `ref-parallel-edges` — several edges on one node pair (three `(Error page)` references from `Validate`) and an A -> B plus B -> A pair (`Start` -> `Check`, `no: (Start)`) draw as separate lines with readable labels, whatever curve style the theme uses. Driven by `examples/parallel-references.mjs`; pixel golden `references` in the visual suite.
- `ref-id-pointer` — `(#id)` targets a node by explicit id. _Not yet driven_ (unit-covered in `app/src/lib/getElements.characterization.test.ts`).
- `container-group` — `Label {` … `}` renders a compound node containing the indented lines. _Not yet driven._
- `container-edges` — lines indented under a closing `}` become edges from the container itself; dagre leaves such edges out of layout, so the child floats. _Not yet driven._

## How to get to it (user POV)

- Type the syntax in the sandbox editor at `/` or in a hosted chart at `/u/:id`.
- Paste a chart that uses it (`ff.pasteDoc`), or load an example that does (the default welcome chart uses `(Label)` references).

## Driving it with drive.mjs

Preconditions:

- Healthy instance; client mode is enough (`launch.sh 3002 --client`).
- Fresh context.

- **Type a chart with references.** `await ff.typeDoc(DOC)` where `DOC` contains `fail: (null)` lines and a node `null`. `ff.waitForGraph(g => g.nodes.some(n => n.label === "Request"))` returns 14 nodes.
- **Endpoints are nodes.** Read `window.__cy.edges()` with `page.evaluate` and check `e.source().isNode()` and `e.target().isNode()` for every edge. `ff.graph()` reports labels, which cannot tell a node `null` from an edge labelled `null`, so this check goes through `__cy`. Expect zero off-node edges and five `fail` edges targeting the node `null`.
- **Drag the shared target.** Mouse-drag from the node's `renderedPosition()` offset by `ff.canvas().boundingBox()`. After `ff.waitForGraph()`, every incoming edge's `targetEndpoint()` lies inside the node's `boundingBox()`. `ff.shot("after-drag", ff.canvas())` shows all five lines ending at the moved node and none running to the top-left corner.

## Gotchas

- `getElements` tags every edge with `parallel`, the count of edges on its unordered node pair. The post style (`graphUtilityClasses.ts`, applied after the user's custom CSS) sets `edge[parallel > 1] { curve-style: bezier }` and a 90px `control-point-step-size` from three up, so parallel edges fan apart under taxi, round-taxi and straight themes. Cytoscape resolves style by order, not specificity, so this rule beats a custom `edge { curve-style }`; "Use Custom CSS Only" skips it. Read `e.midpoint()` from `window.__cy` to prove the fan: collapsed edges share one midpoint.

- Monaco auto-closes `{` when typed, so `ff.typeDoc` of a doc with a container leaves one extra `}` line after the doc. Compare with `startsWith(DOC)`; the stray `}` parses as nothing.
- Edge-id endpoints never reach Cytoscape: `app/src/lib/parseGraph.ts` filters them for render, Mermaid, Visio and Edit with AI. Excalidraw and JSON Canvas export read from `window.__cy`, so they inherit the filter.
- `\(` escapes a literal parenthesis in a label (`Run fallback \(flag is off)`); an unescaped `(…)` at the end of a line is a pointer.
