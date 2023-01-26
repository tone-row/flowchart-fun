import { expect, Page, test } from "@playwright/test";
import jsdom from "jsdom";

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

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto(BASE_URL);
});

test.afterAll(async () => {
  await page.close();
});

test.describe("Sign Up", () => {
  test("yearly sign-up", async () => {
    test.setTimeout(240000);
    await page.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(`${BASE_URL}/sponsor`);
    await page.getByRole("button", { name: "Annually" }).click();
    await page.getByRole("link", { name: "Sign Up Now" }).first().click();
    await expect(page).toHaveURL(`${BASE_URL}/i#annually`);

    await page.getByTestId("email").click();
    email = await getTempEmail();
    await page.getByTestId("email").fill(email);
    const plan = "$30 / Year";
    await page.getByRole("radio", { name: plan }).click();

    const iframe = page.frameLocator("iframe").first();
    await iframe.getByPlaceholder("Card number").click();
    await iframe.getByPlaceholder("Card number").fill("4242 4242 4242 4242");
    await iframe.getByPlaceholder("MM / YY").fill("04 / 24");
    await iframe.getByPlaceholder("CVC").fill("444");
    await iframe.getByPlaceholder("ZIP").fill("44444");
    await page.getByRole("button", { name: "Sign Up" }).click();
    await expect(
      page.getByText(
        "Check your email for a link to log in. You can close this window."
      )
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

    // expect link with "Account" to be present
    await expect(page.getByText("Account")).toBeVisible({ timeout: 10 * 1000 });

    // TODO: delete supabase user, requires updating supabase sdk
  });

  test("can publish chart", async () => {
    // page
    await page.getByRole("link", { name: "New" }).click();
    // expect url to be regex BASE_URL + /u/\d+
    await expect(page).toHaveURL(new RegExp(`${BASE_URL}/u/\\d+`));

    await page.getByRole("button", { name: "Export" }).click();
    await page.getByLabel("Make publicly accessible").check();

    // read the value from the textbox with the name 'Copy Public Link'
    const publicLink = await page.getByRole("textbox", {
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

    /* This should be run in the last test */
    await deleteCustomerByEmail(email);
    console.log("deleted stripe customer: ", email);
  });

  test.only("can convert chart to hosted from Might Lose Trigger", async () => {
    // Create a blank local chart
    await page.goto(`${BASE_URL}/my-new-chart`);

    // Hover [data-testid="might-lose-sponsor-trigger"] then wait for the button to appear
    await page.getByTestId("might-lose-sponsor-trigger").click();

    // Click the Convert to hosted chart? button that appears
    await page
      .getByRole("button", { name: "Convert to hosted chart?" })
      .click();

    // Make sure the input with the label Convert to hosted chart? is checked
    await expect(page.getByLabel("Convert to hosted chart?")).toBeChecked();

    // Submit
    await page.getByRole("button", { name: "Submit" }).click();

    // Expect (my-new-chart) to be visible
    await expect(page.getByText("my-new-chart")).toBeVisible();
  });
});
