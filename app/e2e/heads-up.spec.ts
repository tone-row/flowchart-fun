import { expect, test } from "@playwright/test";

import { BASE_URL, goToPath } from "./utils";

/*
Run single test file
pnpm playwright test e2e/share-links.spec.ts --headed --project=chromium
*/

// Make sure share links are never broken
test.describe("Click Heads Up", () => {
  test.beforeEach(async ({ page }) => {
    await goToPath(page);
  });

  test("Click Heads Up", async ({ page }) => {
    try {
      // click the aria-label "Temporary Flowchart Warning"
      await page
        .getByRole("button", { name: "Temporary Flowchart Warning" })
        .click();

      // expect "This document is only saved on this computer" to be visible
      await expect(page.locator("text=document is only saved")).toBeVisible();

      // click testid might-lose-warning-learn-more
      await page.getByTestId("might-lose-warning-learn-more").click();

      // expect to be at /pricing
      await expect(page).toHaveURL(`${BASE_URL}/pricing`);
    } catch (error) {
      console.log(error);
      // grab screenshot
      await page.screenshot({ path: `test-results/heads-up.png` });
      throw error;
    }
  });
});
