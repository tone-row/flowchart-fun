import { expect, test } from "@playwright/test";

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

  test("share links", async ({ page }) => {
    try {
      await page.getByRole("link", { name: "New" }).click();

      // TODO: someday switch back to this when you can debug why Meta+A doesn't work
      // const encoded = `BYUwNmD2AEDukCcwBMBQBeTnUG8C+GW6QA`;
      // await changeEditorText(page, "hello world");
      const encoded = `CoCwlgzgBAhgDnKB3A9gJwNbQEYE8oAuucYAdgOYBQUUAkqQCYCmpBZ5UAxmkzAU9BhQANmQyEUhEEy4BXND1YiyTarFL5+ADwIAuKNiYAzdDKGcUwlKS48+A2CJiHhagMJ3+j0aXEMwPJwEwviyEOxSMkxaMEFOLoTRBGo0ohgyBOAQ+gAUoJCwCMjoWAaaxOwAlClQANqcYQQoALZ0ACIAulDoNTR4sAz+FOpQAKQArABCtG0TbeoMUDxGTIqcEZl8vTTK6VKQuQ0QTa0zlVAA9BdQAJooslwwNjDCEJJhMuEUwkwAtD4yCzNZosAgQSgXABUlB6zVkwjYAMoQJBrHBlAAEjAAG4yIyyUgAQiggB4NwCR+5RIRdpMIrMU0MIGJQALys1mUADeAF8WWzmUA`;
      const monacoEditor = page.locator(".monaco-editor").nth(0);
      await monacoEditor.click();
      await page.keyboard.type("hello world");

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
