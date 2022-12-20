import { expect, test } from "@playwright/test";

import { nextFrame, sleep } from "../src/test-utils";
import { BASE_URL, changeEditorText, goToPath } from "./utils";

/*
Run single test file
pnpm playwright test e2e/share-links.spec.ts --headed --project=chromium
*/

// Make sure share links are never broken
test.describe("share-links", () => {
  test.beforeEach(async ({ page }) => {
    await goToPath(page);
  });

  // TODO: this is currently broken, because I cannot get the CI to actually
  // clear the input
  const encoded = `BYUwNmD2AEDukCcwBMBQBeTnUG8C+GW6QA`;

  test("share links", async ({ page }) => {
    try {
      await page.getByRole("link", { name: "New" }).click();

      // change editor text
      await changeEditorText(page, "hello world");

      await nextFrame();

      // wait 1 second
      await sleep(1000);

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
