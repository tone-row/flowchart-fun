import { test, expect } from "@playwright/test";
import { changeEditorText, goToPath } from "./utils";

test.beforeEach(async ({ page }) => {
  await goToPath(page);

  // wait a second
  await page.waitForTimeout(1000);

  // change it again to be absolutely certain
  await changeEditorText(page, "Hello\n  World");
});

/* Everything the user can do when not logged in */

test("capabilities", async ({ page }) => {
  // Play with Theme Editor
  await page.getByTestId("Editor Tab: Theme").click();
  await page.getByLabel("Layout", { exact: true }).selectOption("klay");
  await page.getByLabel("Direction").selectOption("RIGHT");
  await page.getByLabel("Spacing").click();

  // Download PNG
  await page.getByLabel("Export").click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByLabel("Download PNG").click();
  const _download = await downloadPromise;

  // Download CSV
  await page.getByRole("tab", { name: "Visio" }).click();
  const download1Promise = page.waitForEvent("download");
  await page.getByTestId("Visio Flowchart").click();
  const _download1 = await download1Promise;
  await page.click('[data-testid="close-button"]');

  await page.getByTestId("Editor Tab: Document").click();

  // Open mermaid.live
  await page.getByLabel("Export").click();
  const page1Promise = page.waitForEvent("popup");

  // Wait for the page to load
  await page.getByTestId("Mermaid Live").click();
  const page1 = await page1Promise;
  expect(page1.url()).toBe(
    "https://mermaid.live/edit#pako:eNo1zrEKwzAMBNBfMZqTIRkzdOrQpVOHDlUHYSuNwbaKkCkl5N9rUrIdj-O4FbwEhgnmJB-_kBoWtDI8EC6ckiA8dxgb3EVTOGBwfX9yZYQOMmumGNrIisU5BFs4M8LUYuCZajIELFurUjW5fYuHybRyB_UdyPgc6aWUD-QQTfT6_7Xf2355ejiC"
  );
  await page.click('[data-testid="close-button"]');

  // View the Learn Syntax Modal
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

  // Expect sandbox warning to show
  await expect(page.getByTestId("sandbox-warning")).toBeVisible({
    timeout: 25000, // 25 seconds
  });
  // Click on test id sandbox-warning-learn-more
  await page.getByTestId("sandbox-warning-learn-more").click();
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
test("paywalls", async ({ page }) => {
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

test("Cannot load a file", async ({ page }) => {
  // Update this test to use NO_ANIMATION_URL
  await goToPath(page);
  await page.getByTestId("load-file-button").click();
  await page.getByRole("button", { name: "Learn More" }).click();
  // expect to be at /pricing
  await page.waitForURL("**/pricing");
});
