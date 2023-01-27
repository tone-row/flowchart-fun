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
      await page
        .getByText(
          "Heads up! Before you clear your cache, remember that this document isn't saved i"
        )
        .click();
      await page.getByRole("link", { name: "Learn More" }).click();
      // expect to be at /sponsor
      await expect(page).toHaveURL(`${BASE_URL}/sponsor`);
    } catch (error) {
      console.log(error);
      // grab screenshot
      await page.screenshot({ path: `test-results/heads-up.png` });
      throw error;
    }
  });
});
