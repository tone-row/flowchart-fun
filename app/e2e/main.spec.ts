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
});
