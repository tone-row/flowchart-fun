import { test, expect } from "@playwright/test";
const { describe, beforeAll } = test;

const startUrl = process.env.E2E_START_URL ?? "http://localhost:3000";

describe.only("User", async () => {
  let page;
  beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(`${startUrl}?animation=0`);
  });

  test("can type", async () => {
    // Select Text
    await page.click(':nth-match(:text("This app works by typing"), 2)');

    // Select All
    await page.press(".view-lines", "Meta+a");

    await page.press(".view-lines", "Backspace");
    await page.type(
      ".view-lines",
      `hello\n  to the: world\n    goodbye: (hello)\n`
    );

    await new Promise((res) => setTimeout(res, 1000)); // wait for animation to finish

    // Click text=Dagre
    await page.click("text=Dagre");
    // Click p:has-text("Breadthfirst")
    await page.click('p:has-text("Breadthfirst")');
  });

  // Add test for changing name of local chart

  // Snapshot 1
  test("can download SVG", async () => {
    await new Promise((res) => setTimeout(res, 1000)); // wait for animation to finish
    await page.click('button:has-text("Export")');

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click('[aria-label="SVG"]'),
    ]);

    const stream = await download.createReadStream();
    const buffer = await streamToBuffer(stream);
    expect(buffer).toMatchSnapshot("1.svg");

    // Close Modal
    await page.click('button:has-text("Close")');
  });

  test("can change layout", async () => {
    await page.click('p:has-text("Breadthfirst")');

    await page.click('p:has-text("Circle")');

    // Need to wait
    // Not sure why this isn't instantaneous
    await new Promise((res) => setTimeout(res, 1000));

    expect(await page.isVisible("text=circle")).toBe(true);
  });

  // Snapshot 2
  test("can download PNG", async () => {
    await new Promise((res) => setTimeout(res, 1000)); // wait for animation to finish
    await page.click('button:has-text("Export")');

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click('[aria-label="PNG"]'),
    ]);

    const stream = await download.createReadStream();
    const buffer = await streamToBuffer(stream);
    expect(buffer).toMatchSnapshot("2.png");

    await page.click('button:has-text("Close")');
  });

  test("can change settings", async () => {
    await page.click('button[role="tab"]:has-text("Settings")');

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
    await page.waitForSelector("text=Paramètres");
    expect(await page.isVisible("text=Paramètres")).toBe(true);
  });

  test("can change other graph options", async () => {
    await page.click('button[role="tab"]:has-text("Éditeur")');
    await page.click('button:has-text("Agrandir")');
    await page.click("text=Lumineux");
    await page.click('p:has-text("Sombre")');
  });

  // Snapshot 3
  test("can download JPG", async () => {
    await new Promise((res) => setTimeout(res, 1000)); // wait for animation to finish
    await page.click('button:has-text("Export")');

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click('[aria-label="JPG"]'),
    ]);

    const stream = await download.createReadStream();
    const buffer = await streamToBuffer(stream);
    expect(buffer).toMatchSnapshot("3.jpg");
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
