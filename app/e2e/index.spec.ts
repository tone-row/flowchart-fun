import { expect, Page, test } from "@playwright/test";
import axios from "axios";
import crypto from "crypto";
const BASE_URL = process.env.E2E_START_URL ?? "http://localhost:3000";

// TODO: Share this context for Auth tests
const EMAIL_DOMAINS_LIST = [];
const SPONSOR_PLANS = ["$1 / Month", "$10 / Year"] as const;
const EMAILS: Record<typeof SPONSOR_PLANS[number], string> = {
  "$1 / Month": "",
  "$10 / Year": "",
};

// Run in parallel
test.describe.configure({ mode: "parallel" });
test.describe("Unauthorized", () => {
  test.beforeEach(async ({ page }) => {
    await goToPath(page);
  });
  test("Learn More -> Sponsors Page", async ({ page }) => {
    await goToTab(page, "Charts");

    await page.click('button:has-text("Learn More")');

    const title = page.locator('h1:has-text("Sponsors")');
    await expect(title).toBeVisible();
  });

  test("Create New Local Chart", async ({ page }) => {
    await goToTab(page, "Charts");
    // Click [placeholder="Enter a title"]
    await page.click('[placeholder="Enter a title"]');
    // Fill [placeholder="Enter a title"]
    await page.fill('[placeholder="Enter a title"]', "My New Chart");
    // Click text=Createflowchart.fun/my-new-chart >> button
    await page.click("text=Createflowchart.fun/my-new-chart >> button");
    await expect(page).toHaveURL(`${BASE_URL}/my-new-chart`);
  });

  test("Open a Chart", async ({ page }) => {
    await goToTab(page, "Charts");
    await page.click('a:has-text("/")');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test("Clone a Chart", async ({ page }) => {
    await goToTab(page, "Charts");
    // Click text=Name/ >> button >> nth=0
    await page.locator("text=Name/ >> button").first().click();
    // Click text=What would you like to name this copy?Create >> input[name="chartTitle"]
    await page
      .locator(
        'text=What would you like to name this copy?Create >> input[name="chartTitle"]'
      )
      .click();
    // Click text=What would you like to name this copy?Create >> input[name="chartTitle"]
    await page
      .locator(
        'text=What would you like to name this copy?Create >> input[name="chartTitle"]'
      )
      .click();
    // Fill text=What would you like to name this copy?Create >> input[name="chartTitle"]
    await page
      .locator(
        'text=What would you like to name this copy?Create >> input[name="chartTitle"]'
      )
      .fill("my copy");
    // Click [aria-label="Duplicate"] button:has-text("Create")
    await page
      .locator('[aria-label="Duplicate"] button:has-text("Create")')
      .click();
    await expect(page).toHaveURL(`${BASE_URL}/my-copy`);
    // Click text=my-copy

    await expect(page.locator("text=my-copy")).toBeVisible();
  });

  test("Delete a chart", async ({ page }) => {
    await goToTab(page, "Charts");
    // Click [placeholder="Enter a title"]
    await page.locator('[placeholder="Enter a title"]').click();
    // Fill [placeholder="Enter a title"]
    await page.locator('[placeholder="Enter a title"]').fill("delete me");

    await page.locator("text=Createflowchart.fun/delete >> button").click();

    // Expect to be on delete-me page
    await expect(page).toHaveURL(`${BASE_URL}/delete-me`);

    await goToTab(page, "Charts");
    // Click [placeholder="Enter a title"]
    await page.locator('[placeholder="Enter a title"]').click();
    // Fill [placeholder="Enter a title"]
    await page.locator('[placeholder="Enter a title"]').fill("delete me");
    // Click text=Createflowchart.fun/delete-me >> button
    await page.locator("text=Createflowchart.fun/delete-me >> button").click();

    await expect(page).toHaveURL(`${BASE_URL}/delete-me`);

    await changeEditorText(page);

    await goToTab(page, "Charts");

    const chart = page.locator("text=/.*/delete-me.*/");
    await expect(chart).toBeVisible();

    // Click text=Name//delete-me >> button >> nth=3
    await page.locator("text=Name//delete-me >> button").nth(3).click();
    // Click button:has-text("Delete")
    await page.locator('button:has-text("Delete")').click();

    await expect(chart).not.toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test("Create New", async ({ page }) => {
    await changeEditorText(page);

    expect(new URL(page.url()).pathname).toBe("/");

    // Click button[role="tab"]:has-text("Create")
    await page.locator('button[role="tab"]:has-text("Create")').click();

    // Make sure no longer on index
    expect(new URL(page.url()).pathname).not.toBe("/");

    // Expect text to be reset
    await expect(
      page.locator("text=before a colon creates a label")
    ).toBeVisible();
  });

  test("Open Help Documentation > View an Example", async ({ page }) => {
    await goToTab(page, "Help");
    await expect(page).toHaveURL(`${BASE_URL}/h`);
    // Click text=Table of Contents
    await page.locator("text=Table of Contents").click();
    // Click a:has-text("Shapes, Colors, Background Colors")
    await page
      .locator('a:has-text("Shapes, Colors, Background Colors")')
      .click();
    await expect(page).toHaveURL(
      `${BASE_URL}/h#shapes,-colors,-background-colors`
    );

    await page
      .locator(
        'pre:has-text("~~~ layout: name: grid ~~~ [.circle] circle [.ellipse] ellipse [.triangle] trian") .code-example-link'
      )
      .click();

    await expect(
      page.locator('div[role="code"] div:has-text("[.circle] circle")').nth(4)
    ).toBeVisible();
  });

  test("Rename chart", async ({ page }) => {
    // Click [aria-label="Rename"]
    await page.locator('[aria-label="Rename"]').click();
    // Fill input[name="name"]
    await page.locator('input[name="name"]').fill("my new chart");
    // Click button:has-text("Submit")
    await page.locator('button:has-text("Submit")').click();
    await expect(page).toHaveURL(`${BASE_URL}/my-new-chart`);
    // Click text=my-new-chart
    await expect(page.locator("text=my-new-chart")).toBeVisible();
    // Click [aria-label="Rename"]
    await page.locator('[aria-label="Rename"]').click();
    // Press a with modifiers
    await page.locator('input[name="name"]').press("Meta+a");
    // Fill input[name="name"]
    await page.locator('input[name="name"]').fill("cool chart");
    // Click button:has-text("Submit")
    await page.locator('button:has-text("Submit")').click();
    await expect(page).toHaveURL(`${BASE_URL}/cool-chart`);
    // Click text=cool-chart
    await expect(page.locator("text=cool-chart")).toBeVisible();
  });

  test("Open Export > Download SVG", async ({ page }) => {
    await openExportDialog(page);
    // Click [aria-label="Download SVG"]
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.locator('[aria-label="Download SVG"]').click(),
    ]);

    expect(download.suggestedFilename()).toBe("flowchart.svg");
  });

  test("Open Export > Download PNG", async ({ page }) => {
    await openExportDialog(page);
    // Click [aria-label="Download PNG"]
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.locator('[aria-label="Download PNG"]').click(),
    ]);

    expect(download.suggestedFilename()).toBe("flowchart.png");
  });

  test("Open Export > Download JPG", async ({ page }) => {
    await openExportDialog(page);
    // Click [aria-label="Download JPG"]
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.locator('[aria-label="Download JPG"]').click(),
    ]);

    expect(download.suggestedFilename()).toBe("flowchart.jpg");
  });

  test("Open Export > Copy FullScreen Link", async ({ page }) => {
    try {
      await openExportDialog(page);

      // Expect input to have the correct value
      await expect(
        page.locator('text=FullscreenCopy >> input[type="text"]')
      ).toHaveValue(
        `${BASE_URL}/f#CoCwlgzgBAhgDnKB3A9gJwNbQEYE8oAuucYAdgOYBQUUAkqQCYCmpBZ5UAxmkzAU9BhQANmQyEUhEEy4BXND1YiyTarFL5+ADwIAuKNiYAzdDKGcUwlKS48+A2CJiHhagMJ3+j0aXEMwPJwEwviyEOxSMkxaMEFOLoTRBGo0ohgyBOAQ+gAUoJCwCMjoWAaaxOwAlClQANqcYQQoALZ0ACIAulDoNTR4sAz+FOpQAKQArABCtG0TbeoMUDxGTIqcEZl8vTTK6VKQuQ0QTa0zlVAA9BdQAJooslwwNjDCEJJhMuEUwkwAtD4yCzNZosAgQSgXABUlB6zVkwjYAMoQJBrHBlAAEjAAG4yIyyUgAQiggB4NwCR+5RIRcgA`
      );

      await Promise.all([
        // Expect Checkmark to be in view
        expect(page.locator('[data-testid="Copied Fullscreen"]')).toMatch(""),
        page.locator('[aria-label="Copy Fullscreen"]').click(),
      ]);
    } catch {
      // Take Screenshot
      await page.screenshot({ path: "ERROR.png" });
    }
  });

  test("Open Export > Copy With Editor Link", async ({ page }) => {
    try {
      await openExportDialog(page);

      // Expect input to have the correct value
      await expect(
        page.locator('text=FullscreenCopy >> input[type="text"]')
      ).toHaveValue(
        `${BASE_URL}/f#CoCwlgzgBAhgDnKB3A9gJwNbQEYE8oAuucYAdgOYBQUUAkqQCYCmpBZ5UAxmkzAU9BhQANmQyEUhEEy4BXND1YiyTarFL5+ADwIAuKNiYAzdDKGcUwlKS48+A2CJiHhagMJ3+j0aXEMwPJwEwviyEOxSMkxaMEFOLoTRBGo0ohgyBOAQ+gAUoJCwCMjoWAaaxOwAlClQANqcYQQoALZ0ACIAulDoNTR4sAz+FOpQAKQArABCtG0TbeoMUDxGTIqcEZl8vTTK6VKQuQ0QTa0zlVAA9BdQAJooslwwNjDCEJJhMuEUwkwAtD4yCzNZosAgQSgXABUlB6zVkwjYAMoQJBrHBlAAEjAAG4yIyyUgAQiggB4NwCR+5RIRcgA`
      );

      await Promise.all([
        // Expect Checkmark to be in view
        expect(
          page.locator('[data-testid="Copied With Editor"]')
        ).toBeVisible(),
        page.locator('[aria-label="Copy With Editor"]').click(),
      ]);
    } catch {
      // Take Screenshot
      await page.screenshot({ path: "ERROR.png" });
    }
  });

  test("Open Export > Copy Mermaid JS code", async ({ page }) => {
    try {
      await openExportDialog(page);

      await Promise.all([
        expect(
          page.locator('[data-testid="Copied Mermaid Code"]')
        ).toBeVisible(),
        page.locator('[aria-label="Copy Mermaid Code"]').click(),
      ]);
    } catch {
      // Take Screenshot
      await page.screenshot({ path: "ERROR.png" });
    }
  });

  test("Open Settings > Change Language", async ({ page }) => {
    await goToTab(page, "Settings");
    // Click [aria-label="Select Language\: Deutsch"]
    await page.locator('[aria-label="Select Language\\: Deutsch"]').click();
    // Click h1:has-text("Einstellungen")
    await expect(page.locator('h1:has-text("Einstellungen")')).toBeVisible();
  });

  test("Open Settings > Change Appearance", async ({ page }) => {
    await goToTab(page, "Settings");
    await page.locator('[aria-label="Dark Mode"]').click();
    // get value of css custom property --color-background
    const [background, foreground] = await page.evaluate(() => {
      return [
        getComputedStyle(document.body).getPropertyValue("--color-background"),
        getComputedStyle(document.body).getPropertyValue("--color-foreground"),
      ];
    });
    expect(background).toBe(" #0f0f0f");
    expect(foreground).toBe(" rgb(250, 250, 250)");
  });
  test("Open Feedback > Type in feedback > Submit", async ({ page }) => {
    await goToTab(page, "Feedback");
    // Click [data-testid="message"]
    await page.locator('[data-testid="message"]').click();
    // Fill [data-testid="message"]
    await page.locator('[data-testid="message"]').fill("This is a test");
    // Click button:has-text("Submit")
    await page.locator('button:has-text("Submit")').click();
    // Click text=Thank you for your feedback!
    await expect(
      page.locator("text=Thank you for your feedback!")
    ).toBeVisible();
  });

  test("Open Feedback > Type feedback with email > Submit", async ({
    page,
  }) => {
    await goToTab(page, "Feedback");
    // Click [data-testid="message"]
    await page.locator('[data-testid="message"]').click();
    // Fill [data-testid="message"]
    await page.locator('[data-testid="message"]').fill("This is a test");

    // Click [data-testid="email"]
    await page.locator('[data-testid="email"]').click();
    // Fill [data-testid="email"]
    await page.locator('[data-testid="email"]').fill("test@test.com");

    await page.locator('button:has-text("Submit")').click();
    // Click text=Thank you for your feedback!
    await expect(
      page.locator("text=Thank you for your feedback!")
    ).toBeVisible();
  });

  test.only("Editor", async ({ page }) => {
    // Type in editor

    // Click text=This app works by typing >> nth=0
    await page.locator("text=This app works by typing").first().click();
    // Press a with modifiers
    await page
      .locator(
        '[aria-label="Editor content\\;Press Alt\\+F1 for Accessibility Options\\."]'
      )
      .press("Meta+a");
    await page
      .locator(
        '[aria-label="Editor content\\;Press Alt\\+F1 for Accessibility Options\\."]'
      )
      .type("hello world");

    await expect(
      page.locator('div[role="code"] >> text=hello world')
    ).toBeVisible();

    // Resize Editor/Graph

    // Contract Graph
    // Click button:has-text("Contract")
    await page.locator('button:has-text("Contract")').click();
    await expect(page.locator("text=spacingFactor: 1")).toBeVisible();

    // Expand Graph
    // Click button:has-text("Expand")
    await page.locator('button:has-text("Expand")').click();
    await expect(page.locator("text=spacingFactor: 1.25")).toBeVisible();

    // Change Graph Options Layout Direction
    // Click form div:has-text("Top to Bottom") >> nth=4
    await page.locator('form div:has-text("Top to Bottom")').nth(4).click();
    // Click p:has-text("Left to Right")
    await page.locator('p:has-text("Left to Right")').click();

    // Change Graph Options Layout
    // Click form div:has-text("Dagre") >> nth=4
    await page.locator('form div:has-text("Dagre")').nth(4).click();
    // Click p:has-text("Breadthfirst")
    await page.locator('p:has-text("Breadthfirst")').click();
    // Click text=name: cose
    await expect(page.locator("text=name: breadthfirst")).toBeVisible();

    // Change Graph Options Theme
    // Click form div:has-text("Light") >> nth=4
    await page.locator('form div:has-text("Light")').nth(4).click();
    // Click p:has-text("Eggs")
    await page.locator('p:has-text("Eggs")').click();
    // Click text=theme: eggs
    await page.locator("text=theme: eggs").click();

    // Disable Graph Animation
    await page.locator('[aria-label="Auto Layout"]').click();
    expect(
      await page
        .locator('[aria-label="Auto Layout"]')
        .getAttribute("aria-checked")
    ).toBe("false");

    await page
      .locator("#cy canvas")
      .first()
      .click({
        button: "right",
        position: {
          x: 463,
          y: 79,
        },
      });
    // Click text=Copy PNG Image
    await page.locator("text=Copy PNG Image").click();
    // Click #cy canvas >> nth=0
    await page
      .locator("#cy canvas")
      .first()
      .click({
        button: "right",
        position: {
          x: 505,
          y: 91,
        },
      });
    // Click text=Copy SVG Code
    await page.locator("text=Copy SVG Code").click();
    // Click #cy canvas >> nth=0
    await page
      .locator("#cy canvas")
      .first()
      .click({
        button: "right",
        position: {
          x: 440,
          y: 74,
        },
      });
    // Click text=Download PNG
    const [png] = await Promise.all([
      page.waitForEvent("download"),
      page.locator("text=Download PNG").click(),
    ]);

    expect(png.suggestedFilename()).toBe("flowchart.png");

    await page
      .locator("#cy canvas")
      .first()
      .click({
        button: "right",
        position: {
          x: 267,
          y: 297,
        },
      });
    // Click text=Download JPG
    const [jpg] = await Promise.all([
      page.waitForEvent("download"),
      page.locator("text=Download JPG").click(),
    ]);

    expect(jpg.suggestedFilename()).toBe("flowchart.jpg");

    await page
      .locator("#cy canvas")
      .first()
      .click({
        button: "right",
        position: {
          x: 485,
          y: 73,
        },
      });
    // Click text=Download SVG
    const [svg] = await Promise.all([
      page.waitForEvent("download"),
      page.locator("text=Download SVG").click(),
    ]);

    expect(svg.suggestedFilename()).toBe("flowchart.svg");
  });

  for (const plan of SPONSOR_PLANS) {
    test.skip(`Sponsors > Become a ${plan} Sponsor`, async ({ page }) => {
      test.setTimeout(60000);

      const email = await getTempEmail();

      // expect email not to be null
      expect(email).toBeTruthy();

      EMAILS[plan] = email;

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

      // Wait 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Make Sure Log in Email is sent
      let emails = await getTempEmailMessage(EMAILS[plan]);

      if (!emails.length) {
        // Wait 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000));

        emails = await getTempEmailMessage(EMAILS[plan]);
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

async function goToPath(page: Page, path = "") {
  await page.goto(`${BASE_URL}/${path}`);
}

async function goToTab(page: Page, tabName: string) {
  await page.click(`button[role="tab"]:has-text("${tabName}")`);
}

async function changeEditorText(page: Page) {
  // Put cursor in editor
  await page.click("text=before a colon creates a label");

  // Delete A Letter
  await page.press(
    '[aria-label="Editor content;Press Alt+F1 for Accessibility Options."]',
    "Delete"
  );
}

async function openExportDialog(page: Page) {
  // Click [aria-label="Export"]
  page.locator('[aria-label="Open Export Dialog"]').click();
  // Click text=Download
  await expect(page.locator("text=Download")).toBeVisible();
}

/** Generates a temp email address */
async function getTempEmail() {
  if (!process.env.RAPID_API_KEY) throw new Error("Missing API Key");

  if (EMAIL_DOMAINS_LIST.length === 0) {
    const response = await axios({
      method: "GET",
      url: "https://privatix-temp-mail-v1.p.rapidapi.com/request/domains/",
      headers: {
        "X-RapidAPI-Host": "privatix-temp-mail-v1.p.rapidapi.com",
        "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      },
    });
    EMAIL_DOMAINS_LIST.push(...response.data);
  }

  const randomDomain =
    EMAIL_DOMAINS_LIST[Math.floor(Math.random() * EMAIL_DOMAINS_LIST.length)];
  const randomEmail = `ci+${Date.now()}${randomDomain}`;
  return randomEmail;
}

/** Returns inbox messages for a given email */
async function getTempEmailMessage(email: string) {
  const hash = crypto.createHash("md5").update(email).digest("hex");
  const response = await axios.request({
    method: "GET",
    url: `https://privatix-temp-mail-v1.p.rapidapi.com/request/mail/id/${hash}/`,
    headers: {
      "X-RapidAPI-Host": "privatix-temp-mail-v1.p.rapidapi.com",
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
    },
  });
  const emails = response.data;
  return emails;
}
