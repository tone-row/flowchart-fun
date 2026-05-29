/**
 * Generates frozen-position fixtures for the visual-regression templates whose
 * layouts are non-deterministic (force-directed). For each, it loads the
 * template, lets the layout settle, captures the node positions from the live
 * cytoscape instance (window.__cy), and writes the full flowchart.fun document
 * string with meta.nodePositions baked in to e2e/visual/fixtures/{name}.doc.txt.
 *
 * The visual test then renders these via a deterministic `preset` layout, so the
 * geometry is fixed and the test checks RENDERING rather than (random) layout.
 *
 * Re-run if a frozen template's content/theme changes:
 *   E2E_START_URL=http://localhost:3001 pnpm -F app visual:fixtures
 *
 * Requires the dev server running (see E2E_START_URL, default :3000).
 */
import path from "path";
import fs from "fs";
import { chromium } from "playwright";
import lzString from "lz-string";

const { decompressFromEncodedURIComponent } = lzString;

const __dirname = path.dirname(import.meta.url.slice(7));
const fixturesDir = path.join(__dirname, "../e2e/visual/fixtures");
const ORIGIN = process.env.E2E_START_URL || "http://localhost:3000";

// Empirically non-deterministic templates (confirmed via the stability check).
// Keep in sync with FROZEN_TEMPLATES in e2e/visual/frozen-templates.ts.
const FROZEN = ["mindmap", "playful-mindmap", "mindmap-dark"];

const DELIM = "=====";

/** Rebuild the canonical docToString format with nodePositions injected. */
function injectPositions(docString, positions) {
  const parts = docString.split(DELIM);
  const text = parts[0].replace(/\n$/, "");
  const meta = JSON.parse((parts[1] || "{}").trim());
  meta.nodePositions = positions;
  return [text, DELIM, JSON.stringify(meta), DELIM].join("\n");
}

async function main() {
  fs.mkdirSync(fixturesDir, { recursive: true });
  const browser = await chromium.launch();

  for (const name of FROZEN) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1000, height: 1000 });
    await page.goto(`${ORIGIN}/?isE2E=true`);
    await page.waitForFunction(
      () => typeof window.__load_template__ === "function",
      null,
      { timeout: 30000 }
    );
    await page.evaluate((n) => window.__load_template__(n, true), name);
    await page.waitForFunction(() => !!window.__cy, null, { timeout: 30000 });
    await page.waitForTimeout(3500);

    const positions = await page.evaluate(() => {
      const nodes = (window.__cy.json().elements.nodes || []);
      const p = {};
      for (const n of nodes) {
        if (n.data && n.data.id && n.position) {
          p[n.data.id] = { x: n.position.x, y: n.position.y };
        }
      }
      return p;
    });

    const link = await page.evaluate(() => window.__get_screenshot_link__());
    const hash = link.split("#")[1];
    const docString = decompressFromEncodedURIComponent(hash);
    const frozen = injectPositions(docString, positions);

    fs.writeFileSync(path.join(fixturesDir, `${name}.doc.txt`), frozen, "utf8");
    console.log(`✅ ${name}: froze ${Object.keys(positions).length} positions`);
    await page.close();
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
