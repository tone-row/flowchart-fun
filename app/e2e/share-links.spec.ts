import { expect, test } from "@playwright/test";

import { BASE_URL, goToPath } from "./utils";

/*
Run single test file
pnpm playwright test e2e/share-links.spec.ts --headed --project=chromium
*/

// Make sure share links are never broken
test.describe("share-links", () => {
  test.beforeEach(async ({ page }) => {
    await goToPath(page);
  });

  test("share links", async ({ page }) => {
    try {
      await page.getByRole("link", { name: "New" }).click();
      const encoded = `BYUwNmD2AEDukCcwBMBQBeTnUG8C+GW6QA`;
      await page
        .getByText("Indenting creates a link to the current line")
        .click();
      await page
        .getByRole("textbox", {
          name: "Editor content;Press Alt+F1 for Accessibility Options.",
        })
        .press("Meta+a");
      await page
        .getByRole("textbox", {
          name: "Editor content;Press Alt+F1 for Accessibility Options.",
        })
        .type("hello world", { delay: 100 });

      // wait for 2 seconds
      await page.waitForTimeout(2000);

      await page.getByRole("button", { name: "Export" }).click();

      // expect the value of input with testid 'Copy Fullscreen'
      expect(
        await page
          .getByTestId("Copy Fullscreen")
          .getAttribute("value")
          .then((value) => value?.trim())
      ).toBe(`${BASE_URL}/f#${encoded}`);

      // 'Copy Editable'
      expect(
        await page
          .getByTestId("Copy Editable")
          .getAttribute("value")
          .then((value) => value?.trim())
      ).toBe(`${BASE_URL}/n#${encoded}`);

      // 'Copy Read-only
      expect(
        await page
          .getByTestId("Copy Read-only")
          .getAttribute("value")
          .then((value) => value?.trim())
      ).toBe(`${BASE_URL}/c#${encoded}`);
    } catch (error) {
      console.log(error);
      // grab screenshot
      await page.screenshot({ path: `test-results/share-links-error.png` });
      throw error;
    }
  });
});
