import { test } from "@playwright/test";

import { goToPath } from "./utils";

/*
Run single test file
pnpm playwright test e2e/share-links.spec.ts --headed --project=chromium
*/

// Make sure share links are never broken
test.describe("Graph Floating Menu", () => {
  test.beforeEach(async ({ page }) => {
    await goToPath(page);
  });

  test("Graph Floating Menu", async ({ page }) => {
    try {
      await page.getByTestId("Zoom Out").click();
      await page.getByTestId("Zoom In").click();
      await page.getByTestId("Fit Graph").click();
    } catch (error) {
      console.log(error);
      // grab screenshot
      await page.screenshot({ path: `test-results/open-syntax-reference.png` });
      throw error;
    }
  });
});
