# Export

The **Export** button opens a dialog to download the graph as PNG, JPG or SVG, copy share links, and export to other tools (Mermaid, Visio, Excalidraw, JSON Canvas). Free users get watermarked, lower-resolution images and no SVG; pro users get clean high-resolution images, SVG and share links.

## Sub-features

- `export-png-free` — PNG downloads with the "flowchart.fun" watermark in its own strip below the chart, never over chart content. Driven by `examples/export.mjs` and `examples/export-watermark.mjs` (counts chart pixels the mark changes).
- `export-svg-gated` — Download SVG is disabled for free users. Driven by `examples/export.mjs`.
- `export-mermaid-copy` — Mermaid tab → Copy puts a `flowchart` definition of the doc on the clipboard. Driven by `examples/export.mjs`.
- `export-jpg` — JPG download, same watermark strip as PNG. Driven by `examples/export-watermark.mjs`.
- `export-pro-images` — pro PNG has no watermark and 3x scale; SVG downloads. _Not yet driven_ (SVG download covered by `app/e2e/pro.spec.ts`).
- `export-links` — pro-only Link section: Fullscreen (`/f#…`), Editable, Read-only (`/c/…`) copy fields. _Not yet driven._
- `export-visio-excalidraw-json` — Visio CSV files, Excalidraw and JSON Canvas copy. _Not yet driven._
- `export-mermaid-live` — "Mermaid Live" opens mermaid.live in a popup. _Not yet driven_ (leaves the app; prefer the copy path).
- `export-context-menu` — right-click on empty canvas offers Download PNG/JPG/SVG, Copy SVG Code, Copy PNG Image. _Not yet driven._

## How to get to it (user POV)

- **Export** button (`aria-label="Export"`) in the editor header, on the sandbox and on `/u/:id`.
- Right-click the empty graph canvas.

## Driving it with drive.mjs

Preconditions:

- Healthy instance; client mode is enough for free-user exports. Pro exports need full mode and `ff.login("pro")`.
- A small doc typed, e.g. `ff.typeDoc("Idea\n  Prototype\n    Launch")`, and `ff.waitForGraph(g => g.nodes.length === 3)`.

- **Open dialog.** `page.getByLabel("Export").first().click()`.
- **PNG.** `const file = await ff.download(() => page.getByLabel("Download PNG").click())`. The file starts with the PNG signature, is wider than 100px and larger than 2KB. Read the PNG: three boxes left to right and the watermark below them.
- **SVG gated.** `expect(page.getByLabel("Download SVG")).toBeDisabled()`.
- **Mermaid.** `page.getByRole("tab", { name: "Mermaid" }).click()`, `page.getByLabel("Copy Mermaid Code").click()`; `getByTestId("Copied Mermaid Code")` appears; `navigator.clipboard.readText()` starts with `flowchart` and contains every node label.
- **Close.** `page.getByTestId("close-button").click()`.

## Gotchas

- Every PNG downloads as `flowchart-fun.png`; a second PNG in the same run overwrites the first in `downloads/`.
- Clipboard reads work only because `drive.mjs` grants clipboard permissions to the context; in a hand-rolled script they throw.
- The Link section renders only when the user has pro access; its absence for free users is correct.
- Free image geometry (`exportLayout` in `app/src/components/downloads.ts`): chart at 1.5x with 30px padding on every side, then the mark (15% of image width, 476:96 aspect) 10px below the chart and 10px above the bottom edge. Image width is `chart + 60`; image height is `chart + 60` for pro and taller by the mark strip for free. `window.__cy.png({ full: true, scale: 1.5 })` rebuilds the clean chart, so a drive can diff it against the download.
- Image export renders from the live graph; wait with `ff.waitForGraph` before downloading so the image shows your doc, not the default chart.
