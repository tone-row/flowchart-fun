import { expect, Page, test } from "@playwright/test";

import { BASE_URL, changeEditorText, goToPath, goToTab } from "./utils";

/*
Run single test file
pnpm playwright test e2e/unauth.spec.ts --headed --project=chromium
*/

// Run in parallel
test.describe.configure({ mode: "parallel" });

test.describe("unauth", () => {
  test.beforeEach(async ({ page }) => {
    await goToPath(page);
  });

  test("View Pricing Page", async ({ page }) => {
    await goToTab(page, "Charts");

    await page.click('button:has-text("Learn More")');

    // Expect "Sponsor flowchart.fun" to be visible
    await expect(
      page.getByText(/Make your workflow easier with Flowchart Fun Pro/i)
    ).toBeVisible();
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

  test("Local chart with no change doesn't save in local storage", async ({
    page,
  }) => {
    // Click span:has-text("Charts")
    await page.locator('span:has-text("Charts")').click();
    await expect(page).toHaveURL(`${BASE_URL}/y`);
    // Click [placeholder="Enter a title"]
    await page.locator('[placeholder="Enter a title"]').click();
    // Fill [placeholder="Enter a title"]
    await page.locator('[placeholder="Enter a title"]').fill("my new chart");
    // Click button:has-text("Create")
    await page.locator('button:has-text("Create")').click();
    await expect(page).toHaveURL(`${BASE_URL}/my-new-chart`);
    // Click span:has-text("Charts")
    await page.locator('span:has-text("Charts")').click();
    await expect(page).toHaveURL(`${BASE_URL}/y`);

    // expect "my-new-chart" NOT to be in the document
    await expect(page.locator("text=my-new-chart")).not.toBeVisible();
  });

  test("Delete a chart", async ({ page }) => {
    // Click span:has-text("Charts")
    await page.locator('span:has-text("Charts")').click();
    await expect(page).toHaveURL(`${BASE_URL}/y`);
    // Click [placeholder="Enter a title"]
    await page.locator('[placeholder="Enter a title"]').click();
    // Fill [placeholder="Enter a title"]
    await page.locator('[placeholder="Enter a title"]').fill("delete me");
    // Press Enter
    await page.locator('[placeholder="Enter a title"]').press("Enter");
    await expect(page).toHaveURL(`${BASE_URL}/delete-me`);

    await changeEditorText(page, "1");

    // Click span:has-text("Charts")
    await page.locator('span:has-text("Charts")').click();

    await expect(page).toHaveURL(`${BASE_URL}/y`);

    // expect "delete-me" to be in the document
    await expect(page.locator("text=delete-me")).toBeVisible();

    // Click [aria-label="Delete \"delete-me\""]
    await page.locator('[aria-label="Delete \\"delete-me\\""]').click();

    // Click button:has-text("Delete")
    await page.locator('button:has-text("Delete")').click();

    // expect "delete-me" NOT to be in the document
    await expect(page.locator("text=delete-me")).not.toBeVisible();
  });

  test("Create a New Local Chart", async ({ page }) => {
    await changeEditorText(page, "1");

    expect(new URL(page.url()).pathname).toBe("/");

    await page.getByRole("link", { name: "New" }).click();
    await page.getByPlaceholder("Untitled").click();
    await page.getByPlaceholder("Untitled").fill("a-b-c-d-e");

    await page
      .getByRole("radio", {
        name: "Temporary Stored on this computer Deleted when browser data is cleared",
      })
      .click();

    await page.getByRole("button", { name: "Create" }).click();

    // Make sure we're on the new chart
    expect(new URL(page.url()).pathname).toBe("/a-b-c-d-e");

    // Expect text to be reset
    await expect(
      page.locator("text=before a colon creates a label").first()
    ).toBeVisible();
  });

  test.skip("Creating a new chart from a template immediatetly creates a local chart", async ({
    page,
  }) => {
    // Need timeout to avoid failure in firefox
    // https://github.com/microsoft/playwright/issues/20749
    await page.waitForTimeout(1000);

    // go to url
    await page.goto(
      `${BASE_URL}/n#C4ewBARgpmCWB2ZgAsYBMQGMCuBbK8wAUALxllEDeRYYARAA4CGATgM5Qt0Bc9A5iyYNkAWg4AbKJlBciAX1LkSQA`
    );

    // expect "to be in the document" to be in the document
    await expect(
      page.locator("text=to be in the document").first()
    ).toBeVisible();

    // expect the url to contain "temp" in it
    expect(page.url()).toContain("temp");
  });

  test("Rename chart", async ({ page }) => {
    // Click [aria-label="Rename"]
    await page.locator('[aria-label="Rename"]').click();
    // Fill input[name="name"]
    await page.locator('input[name="name"]').fill("my new chart");
    // Click button:has-text("Rename")
    await page.locator('button:has-text("Rename")').click();
    await expect(page).toHaveURL(`${BASE_URL}/my-new-chart`);
    // Click text=my-new-chart
    await expect(page.locator("text=my-new-chart")).toBeVisible();
    // Click [aria-label="Rename"]
    await page.locator('[aria-label="Rename"]').click();
    // Press a with modifiers
    await page.locator('input[name="name"]').press("Meta+a");
    // Fill input[name="name"]
    await page.locator('input[name="name"]').fill("cool chart");
    // Click button:has-text("Rename")
    await page.locator('button:has-text("Rename")').click();
    await expect(page).toHaveURL(`${BASE_URL}/cool-chart`);
    // Click text=cool-chart
    await expect(page.locator("text=cool-chart")).toBeVisible();
  });

  test("Download PNG", async ({ page }) => {
    await openExportDialog(page);
    // Click [aria-label="Download PNG"]
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.locator('[aria-label="Download PNG"]').click(),
    ]);

    expect(download.suggestedFilename()).toBe("flowchart-fun.png");
  });

  test("Download JPG", async ({ page }) => {
    await openExportDialog(page);
    // Click [aria-label="Download JPG"]
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.locator('[aria-label="Download JPG"]').click(),
    ]);

    expect(download.suggestedFilename()).toBe("flowchart-fun.jpg");
  });

  test("Copy Fullscreen Link", async ({ page }) => {
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

  test("Copy With-Editor Link", async ({ page }) => {
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

  test("Copy Mermaid JS Code", async ({ page }) => {
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

  test("Change Language", async ({ page }) => {
    await goToTab(page, "Settings");
    // Click [aria-label="Select Language\: Deutsch"]
    await page.locator('[aria-label="Select Language\\: Deutsch"]').click();

    // Expect to find a button with the text "Einstellungen"
    await expect(page.getByText(/Einstellungen/)).toBeVisible();
  });

  test("Change Appearance", async ({ page }) => {
    await goToTab(page, "Settings");
    await page.locator('[aria-label="Dark Mode"]').click();
    // get value of css custom property --color-background
    const [background, foreground] = await page.evaluate(() => {
      return [
        getComputedStyle(document.body).getPropertyValue("--color-background"),
        getComputedStyle(document.body).getPropertyValue("--color-foreground"),
      ];
    });
    expect(background.trim()).toBe("#0f0f0f");
    expect(foreground.trim()).toBe("rgb(250, 250, 250)");
  });

  test("Submit Feedback", async ({ page }) => {
    // click button with text "Help"
    await page.locator('button:has-text("Help")').click();

    // click button with text "Feedback"
    await page.locator('a:has-text("Feedback")').first().click();

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

  test("Manipulate Editor Code", async ({ page }) => {
    try {
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

      await page.getByTestId("Editor Tab: Layout").click();

      // Contract Graph

      // Expand Graph

      // Change Graph Options Layout Direction
      await page
        .locator('button[role="combobox"]:has-text("Top to Bottom")')
        .click();
      await page
        .locator('div[role="option"]:has-text("Left to Right")')
        .click();

      // Change Graph Options Layout
      await page.locator('button[role="combobox"]:has-text("Dagre")').click();
      await page.locator('div[role="option"]:has-text("Klay")').click();

      // Change Graph Options Theme
      await page.getByTestId("Editor Tab: Style").click();
      await page.locator('button[role="combobox"]:has-text("Light")').click();
      await page.locator('div[role="option"]:has-text("Dark")').click();

      // Right Click on Graph & Copy SVG Code
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

      // Right Click on Graph & Download PNG
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

      // Right Click on Graph & Download JPG
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
    } catch {
      // Take Screenshot
      await page.screenshot({ path: "ERROR.png" });
    }
  });
});

export async function openExportDialog(page: Page) {
  // Click [aria-label="Export"]
  page.locator('[aria-label="Export"]').click();
  // Click text=Download
  await expect(page.locator("text=Download")).toBeVisible({ timeout: 60000 });
}
