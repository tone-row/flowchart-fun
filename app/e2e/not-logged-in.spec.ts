import { test, expect } from "@playwright/test";
import { BASE_URL, changeEditorText } from "./utils";

// Add this constant for the no-animation URL
const NO_ANIMATION_URL = `${BASE_URL}?skipAnimation=true`;

test.beforeEach(async ({ page }) => {
  // Update the beforeEach hook to use the NO_ANIMATION_URL
  await page.goto(NO_ANIMATION_URL);
});

/* Everything the user can do when not logged in */

test("can do things when not logged in", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "flowchart.fun" })
  ).toBeVisible();

  // Open mermaid.live
  await page.getByLabel("Export").click();
  const page1Promise = page.waitForEvent("popup");

  // Wait for the page to load
  await page.waitForTimeout(1000);
  await page.getByTestId("Mermaid Live").click();
  const page1 = await page1Promise;
  expect(page1.url()).toBe(
    "https://mermaid.live/edit#pako:eNpdU11v2zAM_CucHooESIo6_U6BAd26Dn0oMKwrimEeBsViEqGy6El0k6zofx9lx56xN4k83lE86lUVZFDN1dLRpljrwLnP2Wc_cvWErqASgQluuyTc1v5drn42oJmA7snY5Q54LTjccgJHRLByCtrHJYUSrJeohl4ByDcFwa7WfNixHY9GuXr0BkNk7Y31K3jYedbbXI3HDeJE9B44EWwsr4XR6QU6oAAGCxst-Z7sVKCPEaEgRz5OwNlnhIPfNfHVp23lKCBQxVIR5220rzxLImvaQBVoFTAm2laiQmnOF7seei7Qa2OgcDpGjOnt2jGGRjWAPALiWlcIo8Mm8mvhahx31RdS_TVNYFo4WzynoXixInYjLAdN9pKX-3dd33WR7EhCX3RklIEYKuoSPaeGqWZnfWOfrpmmBfkXlNn970bPnWXN07XIfqc6wBOF5z6XvL6hjXekTWLv2HYJ-c_ZF6sbaw90RfGqIWuPsKiZBwZlMJ1Crj4jQ2MpmlxJ6D34WZ-Xy3G7Gi34A66sh2-7SnajQ58MATf7NYhd9nSYvUv2MchKgkyr6kFnQ9DHOjKV9g922fM-K5eLYW-XrSPtJTsaprJsP9H9daYmqsRQamvkq73mHkRK5lSKzFyOBpe6dpyr3L8JNPklu1-oOYcaJ6qujGa8sXoVdNkF0VimcN_-3uYTv_0F3BpJCg"
  );
  await page.click('[data-testid="close-button"]');

  // change text in editor
  await changeEditorText(page, "Hello\n  World");

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
  await expect(page.getByTestId("sandbox-warning")).toBeVisible({
    timeout: 60000,
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

test("Cannot load a file", async ({ page }) => {
  // Update this test to use NO_ANIMATION_URL
  await page.goto(NO_ANIMATION_URL);
  await page.getByTestId("load-file-button").click();
  await page.getByRole("button", { name: "Learn More" }).click();
  // expect to be at /pricing
  await page.waitForURL("**/pricing");
});
