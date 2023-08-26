import { test, expect } from "@playwright/test";
import { BASE_URL } from "./utils";

/* Everything the user can do when not logged in */

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
});

test("can do things when not logged in", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "flowchart.fun" })
  ).toBeVisible();

  // change text in editor
  await page.getByText("Begin Typing").click();
  await page
    .getByLabel("Editor content;Press Alt+F1 for Accessibility Options.")
    .press("Meta+a");
  await page
    .getByLabel("Editor content;Press Alt+F1 for Accessibility Options.")
    .fill("Hello\n");
  await page
    .getByLabel("Editor content;Press Alt+F1 for Accessibility Options.")
    .press("Tab");
  await page
    .getByLabel("Editor content;Press Alt+F1 for Accessibility Options.")
    .fill("Hello\n  World");

  // Play with layout
  await page.getByTestId("Editor Tab: Layout").click();
  await page
    .locator('button[role="combobox"]:has-text("Top to Bottom")')
    .click();
  await page.locator('div[role="option"]:has-text("Left to Right")').click();
  await page.locator('button[role="combobox"]:has-text("Dagre")').click();
  await page.locator('div[role="option"]:has-text("Klay")').click();

  // Download PNG
  await page.getByLabel("Export").click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByLabel("Download PNG").click();
  const _download = await downloadPromise;
  const page1Promise = page.waitForEvent("popup");

  // Open mermaid.live
  await page.getByTestId("Mermaid Live").click();
  const page1 = await page1Promise;
  expect(page1.url()).toBe(
    "https://mermaid.live/edit#pako:eNo1zrEKwzAMBNBfMZqTIRkzdOrQpVOHDlUHYSuNwbaKkCkl5N9rUrIdj-O4FbwEhgnmJB-_kBoWtDI8EC6ckiA8dxgb3EVTOGBwfX9yZYQOMmumGNrIisU5BFs4M8LUYuCZajIELFurUjW5fYuHybRyB_UdyPgc6aWUD-QQTfT6_7Xf2355ejiC"
  );

  // Download CSV
  await page.getByRole("tab", { name: "Visio" }).click();
  const download1Promise = page.waitForEvent("download");
  await page.getByTestId("Visio Flowchart").click();
  const _download1 = await download1Promise;
  await page.click('[data-testid="close-button"]');

  // View the Learn Syntax Modal
  await page.getByTestId("Editor Tab: Document").click();
  await page.getByRole("button", { name: "Learn Syntax" }).click();
  await expect(
    page.getByRole("heading", { name: "Learn Syntax" })
  ).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();

  // View the Import Data Modal
  await page.getByRole("button", { name: "Import Data" }).click();
  await expect(
    page.getByRole("heading", { name: "Import Data" })
  ).toBeVisible();
  await page.click('[data-testid="close-dialog"]');

  // Expect sandbox window to show (about 1 minute wait time)
  await expect(
    page.getByRole("heading", { name: "Welcome to Your Sandbox" })
  ).toBeVisible({ timeout: 60000 });
  await page.getByRole("button", { name: "View Pricing" }).click();
  await page.waitForURL("**/pricing");

  // Go back
  await page.goBack();

  // Try some other pages accessible to the user when not logged in
  await page.getByRole("link", { name: "Feedback" }).click();
  await page
    .locator("section")
    .filter({ hasText: "Email" })
    .locator("div")
    .click();
  await page.getByTestId("email").fill("test@test.com");
  await page.getByTestId("message").click();
  await page.getByTestId("message").fill("This is a test");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(
    page.getByRole("heading", { name: "Thank you for your feedback!" })
  ).toBeVisible();

  await page.getByRole("link", { name: "Settings" }).click();
  await page.getByLabel("Select Language: Deutsch").click();
  await expect(
    page.getByRole("heading", { name: "Einstellungen" })
  ).toBeVisible();
  await page.getByLabel("Select Language: English").click();

  await page.getByLabel("Dark Mode").click();
  await page.getByLabel("Light Mode").click();
});

/* Everything the user cannot do when not logged in */
test("cannot do things when not logged in", async ({ page }) => {
  await page.getByRole("link", { name: "New" }).click();
  await expect(
    page.getByText("You need to log in to access this page.")
  ).toBeVisible();

  await page.getByRole("link", { name: "Charts" }).click();
  await expect(
    page.getByText("You need to log in to access this page.")
  ).toBeVisible();

  await page.getByRole("link", { name: "Editor" }).click();
  await page.getByRole("button", { name: "Log in to Save" }).click();

  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
});
