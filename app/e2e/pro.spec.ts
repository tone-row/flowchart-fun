import { expect, Page, test } from "@playwright/test";
import jsdom from "jsdom";
import path from "path";

import { openExportDialog } from "./openExportDialog";
import {
  BASE_URL,
  deleteCustomerByEmail,
  getTempEmail,
  getTempEmailMessage,
} from "./utils";

test.describe.configure({
  mode: "serial",
});

let email = "";

let page: Page;

// temporarily skip these tests, out of rapidapi quota
test.skip(() => true, "Exceeded RapidAPI quota");

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto(BASE_URL);
});

test.afterAll(async () => {
  await page.close();
});

test("Sign Up", async () => {
  // set timeout
  test.setTimeout(240000);

  await page.getByRole("link", { name: "Pricing" }).click();
  await expect(page).toHaveURL(`${BASE_URL}/pricing`);

  await page.getByTestId("yearly-plan-button").click();
  await page.getByRole("button", { name: "Continue" }).click();

  email = await getTempEmail();
  await page.getByTestId("email-input").fill(email);
  await page.getByRole("button", { name: "Continue" }).click();

  const iframe = page.frameLocator(
    'internal:attr=[title="Secure payment input frame"i]'
  );

  await iframe
    .getByPlaceholder("1234 1234 1234 1234")
    .fill("4242 4242 4242 4242");
  await iframe.getByPlaceholder("MM / YY").fill("05 / 50");

  await iframe.getByPlaceholder("CVC").fill("222");
  await iframe.getByRole("combobox", { name: "Country" }).selectOption("US");
  await iframe.getByPlaceholder("12345").fill("12345");

  await page.getByRole("button", { name: "Sign Up" }).click();

  // expect the url to start with "/l"
  await expect(page).toHaveURL(new RegExp(`${BASE_URL}/l`));

  // expect sign up success to be on the screen
  await page
    .getByRole("heading", { name: "Welcome to Flowchart Fun Pro!" })
    .click();

  /* Part 2: Get Auth Email */
  // fill in testid sign-in-magic-email with email
  await page.getByTestId("sign-in-magic-email").fill(email);

  // get button with test id "request-magic-link"
  await page.getByTestId("request-magic-link").click();
  await expect(
    page.getByText(/Check your email for a link to log in/i)
  ).toBeVisible({ timeout: 60000 });

  // wait for email
  let emails = [],
    i = 0;
  while (emails.length === 0 && i < 20) {
    // Wait 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 10000));
    // Check for email
    const response = await getTempEmailMessage(email);
    if (!("error" in response)) {
      emails = response;
    }
    i++;
  }

  expect(emails.length).toBeGreaterThanOrEqual(1);
  const signInEmailIndex = emails.findIndex((email: { mail_html: string }) =>
    /supabase.co\/auth\/v1\/verify/.test(email.mail_html)
  );

  expect(signInEmailIndex).toBeGreaterThanOrEqual(0);

  // apply this to a new document to get link and then load link and confirm the Account link present
  const html = emails[signInEmailIndex].mail_html;
  const { window } = new jsdom.JSDOM(html);
  const { document } = window;
  const link = document.querySelector("a");
  expect(link).toBeTruthy();
  expect(link?.href).toBeTruthy();
  await page.goto(link?.href as string);

  // reload page
  await page.reload();

  // expect link with "Account" to be present
  await expect(page.getByText("Account")).toBeVisible({ timeout: 60 * 1000 });
});

test("Publish Chart", async () => {
  // page
  await page.getByRole("link", { name: "New" }).click();

  // Make a new hosted chart
  await page.getByPlaceholder("Untitled").fill("my new chart");
  await page
    .getByRole("radio", {
      name: "Persistent Stored in the cloud Accessible from any device",
    })
    .click();

  await page.getByRole("button", { name: "Create" }).click();

  // expect url to be regex BASE_URL + /u/\d+
  await expect(page).toHaveURL(new RegExp(`${BASE_URL}/u/\\d+`));

  await page.getByRole("button", { name: "Export" }).click();
  await page.getByLabel("Make publicly accessible").check();

  // read the value from the textbox with the name 'Copy Public Link'
  const publicLink = page.getByRole("textbox", {
    name: "Copy Public Link",
  });

  const publicLinkValue = await publicLink.getAttribute("value");

  if (!publicLinkValue) throw new Error("Public link value is empty");

  // navigate to public url
  await page.goto(publicLinkValue);

  // expect url to be regex BASE_URL + /p/\w+-\w+-\w+
  await expect(page).toHaveURL(new RegExp(`${BASE_URL}/p/\\w+-\\w+-\\w+`));

  // expect Clone button to be present
  await expect(page.getByRole("button", { name: "Clone" })).toBeVisible();
});

test("Download SVG", async () => {
  // Create a blank local chart
  await page.goto(`${BASE_URL}/download-svg`);
  await openExportDialog(page);
  // Click [aria-label="Download SVG"]
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator('[aria-label="Download SVG"]').click(),
  ]);

  expect(download.suggestedFilename()).toBe("download-svg.svg");
});

test("Convert chart to hosted from Might Lose Trigger", async () => {
  // Create a blank local chart
  await page.goto(`${BASE_URL}/my-new-chart`);

  // Hover [data-testid="might-lose-sponsor-trigger"] then wait for the button to appear
  await page.getByTestId("might-lose-sponsor-trigger").click();

  // Make sure the input with the label Convert to hosted chart? is checked
  await page.getByTestId("convert-to-hosted").click();

  // Add a character to make name different
  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("my-new-chart-");

  // Rename
  await page.getByRole("button", { name: "Rename" }).click();

  // expect "/u/" to be in the url
  await expect(page).toHaveURL(new RegExp(`${BASE_URL}/u/\\d+`));
});

test("Create chart from prompt by instruction", async () => {
  await page.getByRole("link", { name: "New" }).click();
  await page.getByRole("radio", { name: "Prompt" }).click();
  await page.getByTestId("instruct").click();
  await page.getByTestId("prompt-entry-textarea").click();
  await page
    .getByTestId("prompt-entry-textarea")
    .fill("the stages of the water cycle");
  await page.getByRole("button", { name: "Create" }).click();
  // expect url to be regex BASE_URL + /u/\d+
  await expect(page).toHaveURL(new RegExp(`${BASE_URL}/u/\\d+`), {
    timeout: 12000,
  });
});

test("Create chart from prompt by extraction", async () => {
  await page.getByRole("link", { name: "New" }).click();
  await page.getByRole("radio", { name: "Prompt" }).click();
  await page.getByTestId("extract").click();
  await page.getByTestId("prompt-entry-textarea").click();
  await page
    .getByTestId("prompt-entry-textarea")
    .fill("a is greater than b but less than a");
  await page.getByRole("button", { name: "Create" }).click();
  // expect url to be regex BASE_URL + /u/\d+
  await expect(page).toHaveURL(new RegExp(`${BASE_URL}/u/\\d+`), {
    timeout: 12000,
  });
});

test("Create chart from imported data", async () => {
  try {
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

    await page.getByTestId("node-label-select").press("Enter");
    await page
      .getByRole("option", { name: "Process Step Description" })
      .press("Enter");

    await page.getByTestId("edges-in-source-node-row").click();

    await page.getByTestId("target-column-select").press("Enter");
    await page.getByRole("option", { name: "Next Step ID" }).press("Enter");

    await page.getByTestId("target-delimiter-input").fill(",");

    await page.getByTestId("edge-label-column-select").press("Enter");
    await page.getByRole("option", { name: "Connector Label" }).press("Enter");

    // click test id "submit-button"
    await page.getByTestId("submit-button").click();

    // expect "You are about to add 9 nodes and 10 edges to your graph." to be visible
    await expect(
      page.getByText("You are about to add 9 nodes and 10 edges to your graph.")
    ).toBeVisible();

    await page.getByRole("button", { name: "Continue" }).click();
  } catch (error) {
    console.error(error);
    throw error;
  }
});

test.afterAll(async () => {
  /* This should be run in the last test */
  await deleteCustomerByEmail(email);
  console.log("deleted stripe customer: ", email);
});
