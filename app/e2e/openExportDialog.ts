import { expect, Page } from "@playwright/test";

export async function openExportDialog(page: Page) {
  // Click [aria-label="Export"]
  page.locator('[aria-label="Export"]').click();
  // Click text=Download
  await expect(page.locator("text=Download")).toBeVisible({ timeout: 60000 });
}
