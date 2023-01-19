import { expect, test } from "@playwright/test";

import { goToPath } from "./utils";

/*
Run single test file
pnpm playwright test e2e/share-links.spec.ts --headed --project=chromium
*/

// Make sure share links are never broken
test.describe("Open syntax reference", () => {
  test.beforeEach(async ({ page }) => {
    await goToPath(page);
  });

  test("Open syntax reference", async ({ page }) => {
    try {
      await page.goto("http://localhost:3000/");
      await page
        .getByRole("combobox", { name: "Syntax" })
        .selectOption("graph-selector");
      await page.getByRole("button", { name: "Syntax Reference" }).click();
      // expect 'Node Label' to be in the document
      await expect(
        page.getByRole("heading", { name: "Node Label" })
      ).toBeVisible();
      await page.getByRole("button", { name: "Close" }).click();
      // expect 'Node Label' to not be in the document
      await expect(
        page.getByRole("heading", { name: "Node Label" })
      ).not.toBeVisible();
    } catch (error) {
      console.log(error);
      // grab screenshot
      await page.screenshot({ path: `test-results/open-syntax-reference.png` });
      throw error;
    }
  });
});
