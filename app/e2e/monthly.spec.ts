import { expect, test } from "@playwright/test";
import jsdom from "jsdom";

import {
  BASE_URL,
  deleteCustomerByEmail,
  getTempEmail,
  getTempEmailMessage,
  goToPath,
} from "./utils";

test.describe("Monthly Sign Up", () => {
  test.beforeEach(async ({ page }) => {
    await goToPath(page);
  });

  test("Monthly Sign-up", async ({ page }) => {
    // set timeout
    test.setTimeout(240000);

    await page.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(`${BASE_URL}/pricing`);

    await page.getByTestId("monthly-plan-button").click();
    await page.getByRole("button", { name: "Continue" }).click();

    const email = await getTempEmail();
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
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Submit" }).click();
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

    // delete customer
    await deleteCustomerByEmail(email);
    console.log("deleted stripe customer: ", email);
  });
});
