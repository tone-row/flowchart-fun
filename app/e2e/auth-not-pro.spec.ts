import { expect, Page, test } from "@playwright/test";
import { BASE_URL, getTempEmail, getTempEmailMessage, goToTab } from "./utils";
import jsdom from "jsdom";

// Run tests in order
test.describe.configure({
  mode: "serial",
});

let email = "";

let page: Page;

// Start test from homepage
test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto(BASE_URL);
});

// Close page
test.afterAll(async () => {
  await page.close();
});

test.describe("Logged In / Not Pro", () => {
  test("Log in with Magic Link", async () => {
    // Go to Log In Page
    await page.getByRole("link", { name: "Log In" }).click();
    await expect(page).toHaveURL(new RegExp(`${BASE_URL}/l`));

    email = await getTempEmail();

    await page.getByLabel("Email").fill(email);
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

    // expect link with "Account" to be present
    await expect(page.getByText("Account")).toBeVisible({ timeout: 10 * 1000 });
  });

  test("Jump to Pricing from Charts", async () => {
    await goToTab(page, "Charts");

    // click test id "to-pricing"
    await page.getByTestId("to-pricing").click();

    // Expect test id pricing-page-title to be visible
    await expect(
      page.locator('[data-testid="pricing-page-title"]')
    ).toBeVisible();
  });
});
