import { test, expect, Page } from "@playwright/test";
import { templates } from "shared";

import { FROZEN_TEMPLATES, frozenScreenshotUrl } from "./frozen-templates";

/**
 * Visual-regression baseline for the 13 templates.
 *
 * Templates exercise every layout, theme and cytoscape-style path, so pixel-
 * diffing their rendered output is high-coverage protection for any rendering
 * change (refactor, framework migration, or a deliberate fix to a render bug).
 *
 * Two render paths:
 *  - Deterministic-layout templates (dagre/layered/mrtree/radial): load the
 *    template and screenshot the live render — this tests BOTH layout and
 *    rendering.
 *  - Force-directed templates (cose/fcose, and any other that proved unstable):
 *    render with FROZEN node positions from a committed fixture, so geometry is
 *    fixed and the test deterministically checks RENDERING (not layout). See
 *    ./frozen-templates.ts. Listed in FROZEN_TEMPLATES.
 */

// window.__load_template__ / __get_screenshot_link__ / __cy are declared
// globally by the app (loadTemplate.ts, useEnsureGetScreenshotLink.ts, Graph).
type TemplateName = (typeof templates)[number];

const RENDER_SETTLE_MS = 3000;

/** Wait for the fullscreen canvas to be visible, fonts loaded, and render settled. */
async function waitForCanvas(page: Page) {
  const canvas = page.locator('[data-flowchart-fun-canvas="true"]');
  await canvas.waitFor({ state: "visible", timeout: 30000 });
  await page.evaluate(() => (document as any).fonts?.ready);
  await page.waitForTimeout(RENDER_SETTLE_MS);
  return canvas;
}

/** Deterministic path: load template on the sandbox, open its screenshot link, screenshot. */
async function renderLive(page: Page, name: TemplateName) {
  await page.goto("/?isE2E=true");
  await page.waitForFunction(
    () => typeof window.__load_template__ === "function",
    null,
    { timeout: 30000 }
  );
  await page.evaluate((n) => window.__load_template__(n, true), name);
  await page.waitForFunction(() => !!window.__cy, null, { timeout: 30000 });
  await page.waitForTimeout(RENDER_SETTLE_MS);

  const link = await page.evaluate(() => window.__get_screenshot_link__());
  expect(link, `screenshot link for ${name}`).toBeTruthy();
  await page.goto(link);
  return waitForCanvas(page);
}

test.describe("template visual regression", () => {
  for (const name of templates) {
    test(name, async ({ page }) => {
      let canvas;
      if (FROZEN_TEMPLATES.includes(name)) {
        // Frozen path: navigate straight to a screenshot URL built from the
        // committed fixed positions, so the layout is a deterministic preset.
        await page.goto(frozenScreenshotUrl(name));
        canvas = await waitForCanvas(page);
      } else {
        canvas = await renderLive(page, name);
      }

      await expect(canvas).toHaveScreenshot(`${name}.png`);
    });
  }
});
