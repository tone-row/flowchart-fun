import { test, expect } from "@playwright/test";
const { describe, beforeEach } = test;

const startUrl = process.env.E2E_START_URL ?? "http://localhost:3000";

describe("App", () => {
  beforeEach(async ({ page }) => {
    // Use the unanimated version for testing
    await page.goto(`${startUrl}?animation=0`);
  });

  test("User can type", async ({ page }) => {
    // Select Text
    await page.click(':nth-match(:text("This app works by typing"), 2)');

    // Select All
    await page.press(".view-lines", "Meta+a");

    // Delete
    await page.press(".view-lines", "Backspace");

    await page.type(".view-lines", `hello\n  [test] world\n  (hello)\n`);

    await page.press(".view-lines", "Meta+Backspace");

    await page.type(".view-lines", `goodbye\n  (test)`);
  });

  test("User can change graph type", async ({ page }) => {
    await page.click('button:has-text("Settings")');

    // Click on selector first
    await page.click(":nth-match(select[name='layout.name'], 2)");

    // Select circle
    await page.selectOption(
      ":nth-match(select[name='layout.name'], 2)",
      "circle"
    );

    // Return to Edit screen
    await page.click('button:has-text("Editor")');

    // Need to wait
    // Not sure why this isn't instantaneous
    await new Promise((res) => setTimeout(res, 1000));

    expect(await page.isVisible("text=circle")).toBe(true);
  });

  test("User can change user settings", async ({ page }) => {
    await page.click('button:has-text("Settings")');

    // Set to dark mode
    await page.click(':nth-match([aria-label="Dark Mode"], 2)');

    // Wait for colors to be replaced
    await new Promise((res) => setTimeout(res, 500));

    // Expect background to be black
    const backgroundColor = await page.$eval("body", (e) =>
      window.getComputedStyle(e).getPropertyValue("background-color")
    );
    expect(backgroundColor).toEqual("rgb(15, 15, 15)");

    // Set to french
    await page.click(':nth-match([aria-label="Select Language: Français"], 2)');

    // Wait for french language to load
    await new Promise((res) => setTimeout(res, 500));

    // Expect the tab to be in French
    expect(await page.isVisible('button[role="tab"]:has-text("Éditeur")')).toBe(
      true
    );
  });

  test("User can create a new graph", async ({ page }) => {
    // Go to charts
    await page.click('button[role="tab"]:has-text("Charts")');
    // Focus chart title
    await page.click(':nth-match(input[name="chartTitle"], 2)');
    // Type title
    await page.type(':nth-match(input[name="chartTitle"], 2)', "My new chart");

    // Create
    await page.press(':nth-match(input[name="chartTitle"], 2)', "Enter");
    const url = await page.$eval("html", () => window.location.pathname);
    expect(url).toEqual("/my-new-chart");
  });
});
