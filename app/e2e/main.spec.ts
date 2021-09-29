import { test, expect } from "@playwright/test";
const { describe } = test;

const startUrl = process.env.E2E_START_URL ?? "http://localhost:3000";

describe("App", () => {
  test("user can type", async ({ page }) => {
    await page.goto(`${startUrl}?animation=0`);

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
    await page.goto(`${startUrl}?animation=0`);

    await page.click("text=DagreTop to Bottom >> :nth-match(svg, 2)");
    // Click p:has-text("Circle")
    await page.click('p:has-text("Circle")');

    // Need to wait
    // Not sure why this isn't instantaneous
    await new Promise((res) => setTimeout(res, 1000));

    expect(await page.isVisible("text=circle")).toBe(true);
  });

  test("User can change user settings", async ({ page }) => {
    await page.goto(`${startUrl}?animation=0`);

    await page.click('button[role="tab"]:has-text("User Preferences")');

    // Click [aria-label="Dark Mode"]
    await page.click('[aria-label="Dark Mode"]');

    // Wait for colors to be replaced
    await new Promise((res) => setTimeout(res, 500));

    // Expect background to be black
    const backgroundColor = await page.$eval("body", (e) =>
      window.getComputedStyle(e).getPropertyValue("background-color")
    );
    expect(backgroundColor).toEqual("rgb(15, 15, 15)");

    // Set to french
    await page.click('[aria-label="Select Language: Français"]');

    // Wait for french language to load
    await new Promise((res) => setTimeout(res, 500));

    // Expect the tab to be in French
    await page.waitForSelector("text=Préférences de l'utilisateur");
    expect(await page.isVisible("text=Préférences de l'utilisateur")).toBe(
      true
    );
  });

  test("User can create a new graph", async ({ page }) => {
    await page.goto(`${startUrl}?animation=0`);
    // Go to charts
    await page.click('button[role="tab"]:has-text("Charts")');
    // Focus chart title

    await page.click('input[name="chartTitle"]');

    // Type title
    await page.type('input[name="chartTitle"]', "My new chart");

    // Create
    await page.press('input[name="chartTitle"]', "Enter");

    const url = await page.$eval("html", () => window.location.pathname);
    expect(url).toEqual("/my-new-chart");
  });
});

describe("Export", () => {
  test("SVG", async ({ page }) => {
    await page.goto(
      `${startUrl}/c#BYUwNmD2BQAEsG0AuIDOSC6sDukBOYAJnPLABSgSQCU0A5pJIQEYCeIJZK61QA`
    );

    await page.click('button:has-text("Export")');

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click('[aria-label="SVG"]'),
    ]);

    const stream = await download.createReadStream();
    const buffer = await streamToBuffer(stream);
    expect(buffer).toMatchSnapshot("test.svg");
  });

  test("PNG", async ({ page }) => {
    await page.goto(
      `${startUrl}/c#BYUwNmD2BQAEsG0AuIDOSC6sDukBOYAJnPLABSgSQCU0A5pJIQEYCeIJZK61QA`
    );

    await page.click('button:has-text("Export")');

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click('[aria-label="PNG"]'),
    ]);

    const stream = await download.createReadStream();
    const buffer = await streamToBuffer(stream);
    expect(buffer).toMatchSnapshot("test.png");
  });

  test("JPG", async ({ page }) => {
    await page.goto(
      `${startUrl}/c#BYUwNmD2BQAEsG0AuIDOSC6sDukBOYAJnPLABSgSQCU0A5pJIQEYCeIJZK61QA`
    );

    await page.click('button:has-text("Export")');

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click('[aria-label="JPG"]'),
    ]);

    const stream = await download.createReadStream();
    const buffer = await streamToBuffer(stream);
    expect(buffer).toMatchSnapshot("test.jpg");
  });
});

function streamToBuffer(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
