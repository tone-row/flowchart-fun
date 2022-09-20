import { expect, test } from "@playwright/test";

import { getTempEmail, getTempEmailMessage, goToPath, goToTab } from "./utils";

const SPONSOR_PLANS = ["$5 / Month", "$50 / Year"] as const;
const EMAIL_ADDRESSES: Record<typeof SPONSOR_PLANS[number], string> = {
  "$5 / Month": "",
  "$50 / Year": "",
};
test.describe("Sign Up", () => {
  test.beforeEach(async ({ page }) => {
    await goToPath(page);
  });

  for (const plan of SPONSOR_PLANS) {
    test(`Sponsors > Become a ${plan} Sponsor`, async ({ page }) => {
      test.setTimeout(240000);

      const email = await getTempEmail();

      // expect email not to be null
      expect(email).toBeTruthy();

      EMAIL_ADDRESSES[plan] = email;

      await goToTab(page, "Sponsors");

      // Click [data-testid="email"]
      await page.locator('[data-testid="email"]').click();
      // Fill [data-testid="email"]
      await page.locator('[data-testid="email"]').fill(email);
      // Click button[role="radio"]:has-text("$1 / Month")
      await page.locator(`button[role="radio"]:has-text("${plan}")`).click();
      // Click [data-testid="card-element"]
      await page.locator('[data-testid="card-element"]').click();
      // Click [placeholder="Card number"]
      await page
        .frameLocator('iframe[name*="__privateStripeFrame"]')
        .locator('[placeholder="Card number"]')
        .click();
      // Fill [placeholder="Card number"]
      await page
        .frameLocator('iframe[name*="__privateStripeFrame"]')
        .locator('[placeholder="Card number"]')
        .fill("4242 4242 4242 4242");
      // Fill [placeholder="MM \/ YY"]
      await page
        .frameLocator('iframe[name*="__privateStripeFrame"]')
        .locator('[placeholder="MM \\/ YY"]')
        .fill("01 / 30");
      // Fill [placeholder="CVC"]
      await page
        .frameLocator('iframe[name*="__privateStripeFrame"]')
        .locator('[placeholder="CVC"]')
        .fill("222");
      // Fill [placeholder="ZIP"]
      await page
        .frameLocator('iframe[name*="__privateStripeFrame"]')
        .locator('[placeholder="ZIP"]')
        .fill("22222");
      // Click button:has-text("Sign Up")
      await page.locator('button:has-text("Sign Up")').click();
      // Click text=Check your email for a link to log in. You can close this window.
      await expect(
        page.locator(
          "text=Check your email for a link to log in. You can close this window."
        )
      ).toBeVisible({ timeout: 60000 });

      let emails = [],
        i = 0;
      while (emails.length === 0 && i < 20) {
        // Wait 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 10000));

        // Make Sure Log in Email is sent
        emails = (await getTempEmailMessage(EMAIL_ADDRESSES[plan])) || [];
        i++;
      }

      expect(emails.length).toBeGreaterThanOrEqual(1);
      expect(
        emails.some((email: { mail_html: string }) =>
          /supabase.co\/auth\/v1\/verify/.test(email.mail_html)
        )
      ).toEqual(true);
    });
  }
});
