# flowchart-fun verification map

The maintained source for verifying flowchart-fun's user-facing behavior. Read this index, then use the matching feature file as the recipe. Every feature file names a passing example in `../examples/`; run it before and after your change.

## Baseline preconditions

- An instance launched by `scripts/launch.sh <port>` (full mode unless the file says client mode is enough) and `scripts/doctor.sh <port>` prints `HEALTHY`.
- Every drive starts in a fresh browser context: logged out, empty localStorage, so `/` shows the default "Welcome to Flowchart Fun" chart (15 nodes).
- Logged-in drives use the `app/.env.e2e` accounts through `ff.login("basic")` (free, no subscription) or `ff.login("pro")` (Stripe test-mode subscription). If every pro drive hangs on `/new`, the pro subscription lapsed — see "Pro tests depend on a live Stripe test-mode subscription" in `CLAUDE.md`.
- Never drive an instance that `launch.sh` did not start.

## Driving conventions

- Drive through `scripts/drive.mjs` with a steps file; `ff.*` helpers are documented in `../SKILL.md`.
- Edit documents with `ff.typeDoc` or `ff.pasteDoc`, never `window.__set_text`.
- Prefer role + accessible name, then `aria-label`, then `data-testid`. The labels are English; a drive that switches language must switch back.
- Graph assertions use `ff.waitForGraph(pred)` and compare node labels and edge `source`/`target` labels, not ids.
- Hosted charts are named with `ff.chartName()`; drive.mjs deletes the ones a run created, by id, when the run ends. Never delete by name pattern.

## Proof and skip reporting

- Capture the user action and the resulting state: steps log + graph/storage/DB assertion + a screenshot you have looked at.
- Sandbox mutations: prove the `flowcharts.fun.sandbox` value. Hosted mutations: prove the `user_charts` row and a reload.
- Report each sub-feature ID you drove and the entry point used. A sub-feature marked _not yet driven_ has no example; say so instead of claiming it.
- Report an unreachable path with the command tried and the unmet precondition (for example: no `app/.env.e2e`, client mode without `/api`).

## Feature entry contract

Each feature file starts with an H1 and one paragraph of user-visible behavior, then exactly four H2s in order: `Sub-features` (short IDs, one line each), `How to get to it (user POV)` (every entry point), `Driving it with drive.mjs` (starts with `Preconditions:`, then labeled bullets pairing a user action with the exact call and the observable result), `Gotchas`.

## Features

- [Sandbox editor](./sandbox-editor.md) — typing the DSL renders a graph; the free chart persists locally for 24h.
- [Themes and templates](./themes-and-templates.md) — Theme tab controls and the Examples dialog restyle and re-lay-out the graph.
- [Export](./export.md) — PNG/JPG/SVG downloads, Mermaid/Visio/Excalidraw/JSON Canvas exports, share links.
- [Hosted charts](./hosted-charts.md) — pro users create, edit, rename, publish and list cloud charts.
- [References and containers](./references-and-containers.md) — `(Label)` pointers draw edges to existing nodes, and only to nodes; `{ }` groups lines into a container.
- [Access and paywalls](./access-and-paywalls.md) — what logged-out and free users are stopped from, and where they are sent.
- [Graph interaction](./graph-interaction.md) — tapping or double-clicking a node or edge reveals its editor line; the `h`/`v` align hotkeys.
- [Graph layout](./graph-layout.md) — auto layout until a drag freezes positions; snap on drop, undoable drags, undo scoped to the loaded document, AI Undo button derived from the newest entry; frozen charts survive text edits, legacy maps, align tools, unfreeze.

## Not yet mapped

Zoom, Import Data (CSV/Visio/Lucid) and Load File for pro, AI convert/prompt/edit, Settings (language, dark mode), Feedback form, Account and subscription management, read-only routes `/r` `/c` `/f` `/p` opened cold, mobile layout. Add a file here when one of them becomes the subject of a change.
