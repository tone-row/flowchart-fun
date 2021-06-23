import { test, expect } from "@playwright/test";
const { describe, beforeEach } = test;

const startUrl = process.env.E2E_START_URL ?? "http://localhost:3000";

describe("App", () => {
  beforeEach(async ({ page }) => {
    await page.goto(startUrl);
  });

  test("Correct Page Title", async ({ page }) => {
    const pageTitle =
      "Flowchart Fun - Easily generate graphs from structured text";
    expect(await page.title()).toBe(pageTitle);
  });

  test.only("User can enter text", async ({ page }) => {
    // Select Text
    await page.click(':nth-match(:text("This app works by typing"), 2)');

    // Select All
    await page.press(".view-lines", "Meta+a");

    // Delete
    await page.press(".view-lines", "Backspace");

    // Type
    await page.type(".view-lines", `Hello\n\tWorld\n\t\t1 2 3`);

    // Wait for graph to animate
    await new Promise((res) => setTimeout(res, 2500));

    // Snapshot
    expect(await page.screenshot()).toMatchSnapshot("basic-editing.png", {
      threshold: 0.5,
    });
  });
});
