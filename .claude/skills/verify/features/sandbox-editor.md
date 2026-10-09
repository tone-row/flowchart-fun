# Sandbox editor

The home page (`/`) is a split view: a Monaco text editor on the left and a live Cytoscape graph on the right. Each line becomes a node, indentation creates edges, `label: Target` labels an edge, `(Target)` links to an existing node, and `.color_x` / `.shape_x` add classes. Logged-out and free users get one chart, kept in localStorage for 24 hours after the last save.

## Sub-features

- `sandbox-render` — typed text re-renders the graph: nodes, edges, edge labels, classes. Driven by `examples/sandbox-edit.mjs`.
- `sandbox-persist` — the doc is saved to `flowcharts.fun.sandbox` with `meta.expires` ≈ now + 24h and survives a reload. Driven by `examples/sandbox-edit.mjs`.
- `sandbox-paste` — pasting 3+ lines also offers "Convert to Flowchart Fun syntax?". _Not yet driven_ beyond observing the overlay text.
- `sandbox-expiry` — every save re-stamps `meta.expires` to now + 24h (also after the mobile Clear button, which writes `meta: {}`), so a chart being edited survives leaving `/` and coming back; an expired or missing stamp resets to the default chart on the next mount of `/`. Driven by `examples/sandbox-expiry.mjs`.
- `sandbox-upsell` — after 3 min of editing (20s with `?isE2E=true`) the "Don't Lose Your Work" modal appears. _Not yet driven_ (covered by `app/e2e/not-logged-in.spec.ts`).
- `sandbox-parse-error` — invalid text shows an editor error instead of crashing the graph. _Not yet driven._
- `sandbox-container-warning` — a container whose `}` is missing, or sits below lines not indented under its `{`, gets a Monaco warning marker on the `{` line; the chart still renders, and moving the `}` up clears the marker and moves the outdented nodes out of the container. Driven by `examples/unclosed-container.mjs`.

## How to get to it (user POV)

- Open `/`, or click **Editor** in the top nav from any page.
- Type in the editor, or paste into it.
- **Examples** button above the editor replaces content (see themes-and-templates).

## Driving it with drive.mjs

Preconditions:

- Healthy instance; client mode is enough (`launch.sh 3002 --client`).
- Fresh context, so the default welcome chart is loaded.

- **Open.** `await ff.open("/")`. `ff.waitForGraph()` returns 15 nodes, the first labelled `Welcome to Flowchart Fun`.
- **Type a document.** `await ff.typeDoc("Ship it?\n  yes: Deploy .color_green\n    Celebrate\n  no: Fix bugs .color_red\n    (Ship it?)")`. `ff.editorText()` equals the input exactly.
- **Graph re-renders.** `ff.waitForGraph(g => g.nodes.some(n => n.label === "Fix bugs"))` returns 4 nodes and edges `Ship it? -> Deploy [yes]`, `Ship it? -> Fix bugs [no]`, `Deploy -> Celebrate`, `Fix bugs -> Ship it?`; `Deploy` has class `color_green`. `ff.shot("graph", ff.canvas())` shows a green Deploy and red Fix bugs.
- **Persisted.** `ff.storage("flowcharts.fun.sandbox")` is a string starting with the doc, then `=====` and JSON metadata whose `expires` is 23–24h ahead.
- **Survives reload.** `page.reload()`; `ff.editorText().trimEnd()` equals the doc and the graph has the same 4 nodes.

## Gotchas

- Monaco auto-indents on Enter. `page.keyboard.type`/`insertText` of a multi-line string doubles indentation and silently changes the graph; use `ff.typeDoc` or `ff.pasteDoc`.
- After a reload the doc has one extra trailing newline (it round-trips through `docToString`). Compare with `trimEnd()`.
- Edge label syntax binds to the line it is on: `  Other: label` under `Start` is an edge `Start -> label [Other]`, not a node named `Other: label`.
- The first graph render after `ff.open` is the default chart; wait for a predicate on your own labels, not just `nodes.length > 0`.
- Monaco auto-closes `{`. Typing `Build {` then more lines pushes the auto-inserted `}` to the end of the doc, so `ff.typeDoc` of a container leaves one trailing `}`.
- Read markers with `window.monaco.editor.getModelMarkers({})` (severity 8 error, 4 warning). The squiggle element sits under `.view-lines`, so Playwright's `hover()` on it times out; move the mouse to its bounding box instead.
- The `Pro tip: Right-click any node…` banner overlays the top of the canvas in screenshots; it is expected.
- `/` loads the sandbox only on mount: leaving for any other route (Feedback, Settings) and returning remounts it and re-runs the expiry check. A drive that wants to see the expiry reset must navigate away and back or reload; editing in place never triggers it.
- The mobile Clear (trash) button has no accessible name; locate it with `page.locator("button.\\!absolute.bottom-1.right-1")` at a phone-width viewport (it is `md:hidden`).
- Submitting Feedback in a drive needs `page.route("**/api/mail", ...)` fulfilling `{"success":true}`; an empty `{}` body makes the form show an error instead of "Thank you for your feedback!".
