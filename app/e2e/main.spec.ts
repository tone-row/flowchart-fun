import { expect, test } from "@playwright/test";
import { Stream } from "stream";
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
    await page.click('button[role="tab"]:has-text("Paramètres")');
    await page.click('[aria-label="Select Language: English"]');
  });

  test("modal is closed when navigating charts", async () => {
    const html = page.locator("html");

    const base = await html.evaluate(
      () => new URL(window.location.href).origin
    );

    await page.click('button[role="tab"]:has-text("Charts")');

    await page.fill('[placeholder="Enter a title"]', "Chart A");

    await page.click("text=Createflowchart.fun/chart-a >> button");

    await expect(page).toHaveURL(`${base}/chart-a`);

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

    await expect(page).toHaveURL(`${base}/chart-b`);

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

  // Take All Snapshots
  test("can download SVG", async () => {
    await new Promise((res) => setTimeout(res, 1000)); // wait for animation to finish
    await page.click('button:has-text("Export")');

    const downloadSVG = await Promise.all([
      page.waitForEvent("download"),
      page.click('[aria-label="SVG"]'),
    ]);

    const svgStream = await downloadSVG[0].createReadStream();
    const svgStr = ((await streamToString(svgStream)) as string).replace(
      /\s/g,
      ""
    );
    expect(svgStr).toEqual(
      `<svgxmlns="http://www.w3.org/2000/svg"xmlns:xlink="http://www.w3.org/1999/xlink"version="1.1"viewBox="00103.5103.5"><defs/><g><rectfill="#ffffff"stroke="none"x="0"y="0"width="103.5"height="103.5"/><gtransform="translate(1.5,1.5)scale(1.5,1.5)"><pathfill="rgb(255,255,255)"stroke="rgb(0,0,0)"paint-order="fillstrokemarkers"d="M33.50.5L58.50.5L58.50.5A8800166.58.5L66.558.5L66.558.5A8800158.566.5L8.566.5L8.566.5A880010.558.5L0.58.5L0.58.500000000000002A880018.50.5L33.50.5Z"fill-opacity="1"stroke-opacity="1"stroke-miterlimit="10"/><textfill="rgb(0,0,0)"stroke="none"font-family="Helvetica,Arial,sans-serif,AppleColorEmoji,SegoeUIEmoji,SegoeUISymbol"font-size="10px"font-style="normal"font-weight="normal"text-decoration="normal"x="33.5"y="38.5"text-anchor="middle"dominant-baseline="text-after-edge"fill-opacity="1">x</text><gtransform="scale(0.6666666666666666,0.6666666666666666)translate(-1.5,-1.5)"/></g></g><!--OriginalFlowchartText(flowchart.fun):x--></svg>`
    );
  });
});

function streamToString(stream: Stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}
