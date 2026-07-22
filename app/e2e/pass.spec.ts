import { test, expect, Page } from "@playwright/test";
import {
  BASE_URL,
  TESTING_EMAIL,
  TESTING_PASSWORD,
  TESTING_EMAIL_PRO,
  TESTING_PASS_PRO,
  goToPath,
  deleteCustomerByEmail,
} from "./utils";

test.skip(({ browserName }) => browserName !== "chromium", "Chrome Only");

async function logIn(page: Page, email: string, password: string) {
  await goToPath(page);
  await page.getByRole("link", { name: "Log In" }).click();
  await page.getByTestId("sign-in-email").click();
  await page.getByTestId("sign-in-email").fill(email);
  await page.getByTestId("sign-in-email").press("Tab");
  await page.getByTestId("sign-in-password").fill(password);
  await page.getByTestId("sign-in-email-pass").click();
  await expect(page.getByRole("link", { name: "Account" })).toBeVisible();
}

/**
 * CI-safe checks: never complete a purchase, so the shared non-pro test
 * account stays non-pro for the paywall assertions in logged-in.spec.ts.
 */
test.describe("30-Day Pass CTAs", () => {
  test("pricing page shows the pass ticket; logged-out checkout asks for login", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/pricing?isE2E=true`);
    await expect(page.locator("#pass")).toBeVisible();
    await page
      .locator("#pass")
      .getByRole("button", { name: "Get a 30-Day Pass" })
      .click();
    await expect(
      page.getByText("Log in to upgrade your account")
    ).toBeVisible();
  });

  test("free user reaches Stripe checkout for the $9 pass", async ({
    page,
  }) => {
    await logIn(page, TESTING_EMAIL, TESTING_PASSWORD);
    await page.goto(`${BASE_URL}/pricing?isE2E=true`);
    await page.getByTestId("pass-button").click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 });
    await expect(page.getByText("$9.00").first()).toBeVisible();
    await expect(page.getByText(/30-Day Pass/).first()).toBeVisible();
  });

  test("subscriber sees no pass callout", async ({ page }) => {
    await logIn(page, TESTING_EMAIL_PRO, TESTING_PASS_PRO);
    // Wait until customer-info resolves and the app knows the user is pro
    await page.getByTestId("pro-link").waitFor({ state: "detached" });
    await page.goto(`${BASE_URL}/pricing?isE2E=true`);
    await expect(page.getByText("You're already a Pro User")).toBeVisible();
    await expect(page.getByTestId("pass-button")).toHaveCount(0);
  });
});

/**
 * Full test-card purchase. Requires a DEDICATED account (do not use
 * TESTING_EMAIL — a pass would make it pro for 30 days and break the
 * paywall specs). Setup: create the account on the staging Supabase, set
 * TESTING_EMAIL_PASS / TESTING_PASS_PASS in .env.e2e, and add the email to
 * EXCLUDED_USER_FROM_DELETION so the nightly cron keeps the login alive.
 * The Stripe customer is deleted before and after so entitlement state is
 * deterministic per run.
 */
const TESTING_EMAIL_PASS = process.env.TESTING_EMAIL_PASS;
const TESTING_PASS_PASS = process.env.TESTING_PASS_PASS;

test.describe("30-Day Pass full purchase", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(
    !TESTING_EMAIL_PASS || !TESTING_PASS_PASS,
    "TESTING_EMAIL_PASS / TESTING_PASS_PASS not configured"
  );

  test.beforeAll(async () => {
    await deleteCustomerByEmail(TESTING_EMAIL_PASS as string);
  });

  test.afterAll(async () => {
    await deleteCustomerByEmail(TESTING_EMAIL_PASS as string);
  });

  test("buys a pass with the test card and gains pro access", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await logIn(
      page,
      TESTING_EMAIL_PASS as string,
      TESTING_PASS_PASS as string
    );
    await page.goto(`${BASE_URL}/pricing?isE2E=true`);
    await page.getByTestId("pass-button").click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 });

    // Stripe hosted checkout, test mode
    await page.fill("#cardNumber", "4242 4242 4242 4242");
    await page.fill("#cardExpiry", "05 / 50");
    await page.fill("#cardCvc", "222");
    await page.fill("#billingName", "E2E Pass Tester");
    const zip = page.locator("#billingPostalCode");
    if (await zip.isVisible().catch(() => false)) {
      await zip.fill("12345");
    }
    await page.locator(".SubmitButton").click();

    await page.waitForURL(/\/success\?pass=true/, { timeout: 60_000 });
    await expect(page.getByText("Your 30-Day Pass is Active!")).toBeVisible();

    // The account page shows the pass
    await page.goto(`${BASE_URL}/a?isE2E=true`);
    await expect(page.getByText("30-Day Pass")).toBeVisible();
    await expect(page.getByText("Access until")).toBeVisible();

    // And pro access is real: create a hosted chart
    await goToPath(page);
    await page.getByTestId("new-chart-link").click();
    await page.getByLabel("Name Chart").fill("pass chart");
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page).toHaveURL(new RegExp(`${BASE_URL}/u/\\d+`));
  });
});
