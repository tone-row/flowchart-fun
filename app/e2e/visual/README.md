# Visual regression

Pixel-diffs the rendered graph for every template against committed golden
images. This is the **rendering half of the safety net**: a refactor, a
framework migration, or a deliberate fix to a render bug that changes how a
chart looks will fail here loudly — and you review the diff before accepting a
new golden.

## Running

Requires the flowchart-fun dev server. If something else owns `:3000`, run it
elsewhere and point the tests at it with `E2E_START_URL`:

```bash
# start the app (client-only is enough — visual tests hit no /api routes)
BROWSER=none PORT=3001 pnpm -F app dev

# compare current render against goldens
E2E_START_URL=http://localhost:3001 pnpm -F app visual

# (re)generate goldens — do this after an intentional visual change, and review the diff
E2E_START_URL=http://localhost:3001 pnpm -F app visual:update
```

## Deterministic vs frozen templates

Most templates use deterministic layouts (dagre/layered/mrtree/radial, and even
the cose network-diagrams converge stably) and are rendered live — so the test
covers **both layout and rendering**.

Three mindmap templates use a force-directed layout that re-randomizes node
positions every render. They are listed in `frozen-templates.ts` and rendered
from a committed fixture (`fixtures/{name}.doc.txt`) with `meta.nodePositions`
baked in, so geometry is fixed via a `preset` layout and the test
deterministically checks **rendering** (not layout). The flaky set was found
empirically (failed two consecutive comparison runs), not assumed from layout
name.

Regenerate fixtures if a frozen template's content/theme changes:

```bash
E2E_START_URL=http://localhost:3001 pnpm -F app visual:fixtures
# then regenerate those goldens:
E2E_START_URL=http://localhost:3001 pnpm -F app visual:update -- -g mindmap
```

## Not yet wired to CI

Playwright goldens are platform-specific (suffixed `-darwin` here). CI is Linux,
so running this in CI needs Linux-generated goldens (e.g. via the Playwright
Docker image). That's a deliberate follow-up — today this is a **local**
pre-migration / pre-render-fix tool, like `scripts/screenshot-templates.mjs`.
