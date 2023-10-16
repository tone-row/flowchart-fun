import { test, expect } from "@playwright/test";
import { BASE_URL, TESTING_EMAIL_PRO, TESTING_PASS_PRO } from "./utils";
import path from "path";

/* Log In */
test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await page.getByRole("link", { name: "Log In" }).click();
  await page.getByTestId("sign-in-email").click();
  await page.getByTestId("sign-in-email").fill(TESTING_EMAIL_PRO);
  await page.getByTestId("sign-in-email").press("Tab");
  await page.getByTestId("sign-in-password").fill(TESTING_PASS_PRO);
  await page.getByTestId("sign-in-email-pass").click();
  await expect(page.getByRole("link", { name: "Account" })).toBeVisible();
  // Wait for the Upgrade link to dissappear because it means we know the user is PRO
  await page.getByTestId("pro-link").waitFor({ state: "detached" });
});

test("Create new chart", async ({ page }) => {
  await page.getByRole("link", { name: "New" }).click();
  await page.getByLabel("Name Chart").fill("my new chart");
  await page.getByRole("button", { name: "Create" }).click();
  // expect url to be regex BASE_URL + /u/\d+
  await expect(page).toHaveURL(new RegExp(`${BASE_URL}/u/\\d+`));
});

test("Rename Chart", async ({ page }) => {
  await page.getByLabel("Rename").click();
  await page.getByRole("textbox").fill("to publish");
  await page.getByRole("button", { name: "Rename" }).click();
  await expect(page.getByLabel("Rename")).toHaveText("to publish");
});

test("Publish Chart & Clone from Public", async ({ page }) => {
  let publicLinkValue: string | null = "";
  await page.getByRole("button", { name: "Export" }).click();
  await page.getByLabel("Make publicly accessible").check();

  // read the value from the textbox with the name 'Copy Public Link'
  const publicLink = page.getByRole("textbox", {
    name: "Copy Public Link",
  });

  publicLinkValue = await publicLink.getAttribute("value");

  expect(publicLinkValue).toBeTruthy();

  if (!publicLinkValue) throw new Error("publicLinkValue is not set");

  // navigate to public url
  await page.goto(publicLinkValue);

  // expect url to be regex BASE_URL + /p/\w+-\w+-\w+
  await expect(page).toHaveURL(new RegExp(`${BASE_URL}/p/\\w+-\\w+-\\w+`));

  // Click Clone
  const page1Promise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Clone" }).click();
  const page1 = await page1Promise;

  // expect url to be regex BASE_URL + /u/\d+
  await expect(page1).toHaveURL(new RegExp(`${BASE_URL}/u/\\d+`));

  // Close page1
  await page1.close();
});

test("Open Chart From Charts Page", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.getByRole("link", { name: "Charts" }).click();
  await page.getByRole("link", { name: /to publish.*/gi }).click();
});

test("Download SVG", async ({ page }) => {
  await page.getByLabel("Export").click();

  // Click [aria-label="Download SVG"]
  const download1Promise = page.waitForEvent("download");
  await page.getByLabel("Download SVG").click();
  const _download1 = await download1Promise;

  await page.getByTestId("close-button").click();
});

test("Go to Sandbox. Save Sandbox Chart", async ({ page }) => {
  await page.goto(BASE_URL);

  // wait for the test-id "pro-link" to disappear
  await page.getByTestId("pro-link").waitFor({ state: "detached" });

  await page.getByRole("button", { name: "Save" }).click();
  await page.getByLabel("Title").click();
  await page.getByLabel("Title").fill("my saved chart");
  await page.getByRole("button", { name: "Save" }).click();

  // expect "/u/" to be in the url
  await expect(page).toHaveURL(new RegExp(`${BASE_URL}/u/\\d+`));
});

test("Create chart from ai", async ({ page }) => {
  await page.getByRole("link", { name: "New" }).click();
  await page.getByTestId("Use AI").click();
  await page.locator('textarea[name="subject"]').click();
  await page
    .locator('textarea[name="subject"]')
    .fill("the stages of the water cycle");
  await page.getByRole("button", { name: "Create" }).click();
  // expect url to be regex BASE_URL + /u/\d+
  await expect(page).toHaveURL(new RegExp(`${BASE_URL}/u/\\d+`), {
    timeout: 1000 * 60 * 4,
  });
});

test("Create chart from imported data", async ({ page }) => {
  try {
    await page.getByRole("link", { name: "New" }).click();
    await page.getByRole("button", { name: "Create" }).click();
    await page.waitForURL(new RegExp(`${BASE_URL}/u/\\d+`));
    await page.getByRole("button", { name: "Import Data" }).click();

    const filePath = path.join(
      __dirname,
      "../../api/data/fixtures/example-visio-process.csv"
    );

    // make the file input visible
    // execute this code on the page: document.querySelector("[data-testid=import-data-file-uploader]").style.display = "block"
    await page.evaluate(() => {
      const fileInput = document.querySelector(
        "[data-testid=import-data-file-uploader]"
      ) as HTMLElement;
      fileInput.style.display = "block";
    });

    // click the text "Drag and drop a CSV file here, or click to select a file"
    // await page.getByText("Drag and drop a CSV file here").click();
    // await page.getByTestId("import-data-file-uploader").click();
    await page.getByTestId("import-data-file-uploader").setInputFiles(filePath);

    await page
      .getByTestId("node-label-select")
      .selectOption("Process Step Description");
    await page.getByTestId("edges-in-source-node-row").click();
    await page.getByTestId("target-column-select").selectOption("Next Step ID");
    await page.getByTestId("target-delimiter-input").click();
    await page.getByTestId("target-delimiter-input").fill(",");
    await page
      .getByTestId("edge-label-column-select")
      .selectOption("Connector Label");
    await page.getByTestId("import-submit-button").click();

    await expect(
      page.getByText("You are about to add 9 nodes and 10 edges to your graph.")
    ).toBeVisible();

    await page.getByRole("button", { name: "Continue" }).click();
  } catch (error) {
    console.error(error);
    throw error;
  }
});
