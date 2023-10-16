import { expect, Page, test } from "@playwright/test";
import jsdom from "jsdom";

import { BASE_URL, getTempEmail, getTempEmailMessage } from "./utils";

let page: Page;
let email = "";

test.describe.configure({
  mode: "serial",
});

test.skip(({ browserName }) => browserName !== "chromium", "Chromium only!");

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

  await page.getByRole("link", { name: "Flowchart Fun Pro" }).click();
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
  // make sure test id welcome-message is visible
  await expect(page.getByTestId("welcome-message")).toBeVisible();

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

  // Wait for the Upgrade link to dissappear because it means we know the user is PRO
  await page.getByTestId("pro-link").waitFor({ state: "detached" });
});
