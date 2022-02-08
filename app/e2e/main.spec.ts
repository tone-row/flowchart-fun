import { expect, test } from "@playwright/test";
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
    await page.click("text=This app works by typing");

    // Select All
    await page.press(
      '[aria-label="Editor content;Press Alt+F1 for Accessibility Options."]',
      "Control+a"
    );

    await page.press(".view-lines", "Backspace");
    await page.type(".view-lines", `hello\n  to the: world`);

    await new Promise((res) => setTimeout(res, 1000)); // wait for animation to finish

    // Click text=Dagre
    await page.click("text=Dagre");
    // Click p:has-text("Breadthfirst")
    await page.click('p:has-text("Breadthfirst")');
  });

  test("can change layout", async () => {
    await page.click('p:has-text("Breadthfirst")');

    await page.click('p:has-text("Circle")');

    // Need to wait
    // Not sure why this isn't instantaneous
    await new Promise((res) => setTimeout(res, 1000));

    expect(await page.isVisible("text=circle")).toBe(true);
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

  // Take All Snapshots
  test("can download SVG", async () => {
    await new Promise((res) => setTimeout(res, 1000)); // wait for animation to finish
    await page.click('button:has-text("Export")');

    const downloadSVG = await Promise.all([
      page.waitForEvent("download"),
      page.click('[aria-label="SVG"]'),
    ]);

    const downloadPNG = await Promise.all([
      page.waitForEvent("download"),
      page.click('[aria-label="PNG"]'),
    ]);

    const downloadJPG = await Promise.all([
      page.waitForEvent("download"),
      page.click('[aria-label="JPG"]'),
    ]);

    const svgStream = await downloadSVG[0].createReadStream();
    const svgBuffer = await streamToBuffer(svgStream);

    const pngStream = await downloadPNG[0].createReadStream();
    const pngBuffer = await streamToBuffer(pngStream);

    const jpgStream = await downloadJPG[0].createReadStream();
    const jpgBuffer = await streamToBuffer(jpgStream);

    expect(svgBuffer).toMatchSnapshot("svg.svg", { threshold: 0.5 });
    expect(pngBuffer).toMatchSnapshot("png.png", { threshold: 0.5 });
    expect(jpgBuffer).toMatchSnapshot("jpg.jpg", { threshold: 0.5 });
  });

  test.only("modal is closed when navigating charts", async () => {
    await page.click('button[role="tab"]:has-text("Charts")');

    await page.fill('[placeholder="Enter a title"]', "Chart A");

    await page.click("text=Createflowchart.fun/chart-a >> button");

    await expect(page).toHaveURL("http://localhost:3000/chart-a");

    await page.click("text=This app works by typing");

    await page.press(
      '[aria-label="Editor content;Press Alt+F1 for Accessibility Options."]',
      "Meta+a"
    );
    await page.fill(
      '[aria-label="Editor content;Press Alt+F1 for Accessibility Options."]',
      "x"
    );

    await page.click('button[role="tab"]:has-text("Charts")');

    await page.fill('[placeholder="Enter a title"]', "Chart B");

    await page.click("text=Createflowchart.fun/chart-b >> button");

    await expect(page).toHaveURL("http://localhost:3000/chart-b");

    await page.click("text=This app works by typing");

    await page.press(
      '[aria-label="Editor content;Press Alt+F1 for Accessibility Options."]',
      "Meta+a"
    );

    await page.fill(
      '[aria-label="Editor content;Press Alt+F1 for Accessibility Options."]',
      "x"
    );

    await page.click('button:has-text("Export")');

    expect(await page.locator("[aria-label=Export]").isVisible()).toBe(true);

    await page.goBack();

    expect(await page.locator("[aria-label=Export]").isVisible()).toBe(false);
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
