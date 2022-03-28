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
      /\n/g,
      ""
    );
    expect(svgStr).toEqual(
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 741 811.5">  <defs/>  <g>    <rect fill="#ffffff" stroke="none" x="0" y="0" width="741" height="811.5"/>    <g transform="translate(59.02734375,69.28125) scale(1.5,1.5)">      <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 187.55091534565727 18.69624104321599 L 64.78563074213645 114.20938617157844" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>      <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 67.40253687375288 106.66191624462225 L 63.20710724708172 115.4375 L 72.74483202738662 113.52849344811027 Z" fill-opacity="1"/>      <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 221.2705572106031 25.8125 L 214.45102190005065 113.44352874059916" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>      <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 210.63396349404394 106.42622404968446 L 214.2958490393969 115.4375 L 219.30773847243756 107.10122599352832 Z" fill-opacity="1"/>      <g transform="translate(217.82199634016342,70.12650718514979) rotate(-85.5501529333441,0,0)">        <rect fill="rgb(255,255,255)" stroke="none" x="-21" y="-8" width="42" height="16" fill-opacity="1"/>        <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="0" y="5" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">any text</text>        <g transform="rotate(85.5501529333441,0,0) translate(-217.82199634016342,-70.12650718514979)">          <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 260.564453125 13.18688268469132 Q 320.1253832126899 50.48151420926174 365.180302821948 106.38033672052222" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>          <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 357.53285062374215 104.0186606437788 L 366.4353894807274 107.9375 L 364.2289376515132 98.4641653006791 Z" fill-opacity="1"/>          <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 348.6796875 116.51287311745864 Q 293.24955422249474 80.10734442699209 252.61859566185726 27.396524728724877" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>          <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 260.2134508665671 29.92261179519792 L 251.3975855641152 25.8125 L 253.399015309428 35.33125931908025 Z" fill-opacity="1"/>          <g transform="translate(296.9493479017117,76.03102167504193) rotate(42.994752957589874,0,0)">            <rect fill="rgb(255,255,255)" stroke="none" x="-20" y="-8" width="40" height="16" fill-opacity="1"/>            <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="0" y="5" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">like this</text>            <g transform="rotate(-42.994752957589874,0,0) translate(-296.9493479017117,-76.03102167504193)">              <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 401.09375 193.9375 L 401.09375 270.0625" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>              <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 396.74375 263.3625 L 401.09375 272.0625 L 405.44375 263.3625 Z" fill-opacity="1"/>              <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 407.6414939664218 311.0625 Q 421.09375 351.125 412.7238811158034 389.2340592633575" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>              <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 409.7033894831298 381.8121684328452 L 412.29484814687714 391.1875 L 418.24023820235254 383.4891341287093 Z" fill-opacity="1"/>              <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 389.89265185312286 391.1875 Q 381.09375 351.125 393.90937413798133 312.9584693640744" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>              <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 396.1031957436208 320.6639405276988 L 394.5460060335782 311.0625 L 387.7991674374447 318.0691160846534 Z" fill-opacity="1"/>              <g transform="translate(386.4973814977761,351.59899234101863) rotate(-86.67621332645912,0,0)">                <rect fill="rgb(255,255,255)" stroke="none" x="-20" y="-8" width="40" height="16" fill-opacity="1"/>                <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="0" y="5" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">like this</text>                <g transform="rotate(86.67621332645912,0,0) translate(-386.4973814977761,-351.59899234101863)">                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 224.033203125 -44.6875 L 252.064453125 -44.6875 L 252.064453125 -44.6875 A 8 8 0 0 1 260.064453125 -36.6875 L 260.064453125 17.3125 L 260.064453125 17.3125 A 8 8 0 0 1 252.064453125 25.3125 L 196.001953125 25.3125 L 196.001953125 25.3125 A 8 8 0 0 1 188.001953125 17.3125 L 188.001953125 -36.6875 L 188.001953125 -36.6875 A 8 8 0 0 1 196.001953125 -44.6875 L 224.033203125 -44.6875 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="224.033203125" y="-17.1875" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">This app </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="224.033203125" y="-4.6875" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">works by </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="224.033203125" y="7.8125" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">typing </text>                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 17.578125 115.9375 L 65.0078125 115.9375 L 65.0078125 115.9375 A 8 8 0 0 1 73.0078125 123.9375 L 73.0078125 177.9375 L 73.0078125 177.9375 A 8 8 0 0 1 65.0078125 185.9375 L -29.8515625 185.9375 L -29.8515625 185.9375 A 8 8 0 0 1 -37.8515625 177.9375 L -37.8515625 123.9375 L -37.8515625 123.9375 A 8 8 0 0 1 -29.8515625 115.9375 L 17.578125 115.9375 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="17.578125" y="143.4375" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">Indenting creates a </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="17.578125" y="155.9375" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">link to the current </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="17.578125" y="168.4375" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">line </text>                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 211.533203125 115.9375 L 252.267578125 115.9375 L 252.267578125 115.9375 A 8 8 0 0 1 260.267578125 123.9375 L 260.267578125 177.9375 L 260.267578125 177.9375 A 8 8 0 0 1 252.267578125 185.9375 L 170.798828125 185.9375 L 170.798828125 185.9375 A 8 8 0 0 1 162.798828125 177.9375 L 162.798828125 123.9375 L 162.798828125 123.9375 A 8 8 0 0 1 170.798828125 115.9375 L 211.533203125 115.9375 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="211.533203125" y="149.6875" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">before a colon </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="211.533203125" y="162.1875" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">creates a label </text>                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 401.09375 108.4375 L 445.0078125 108.4375 L 445.0078125 108.4375 A 8 8 0 0 1 453.0078125 116.4375 L 453.0078125 185.4375 L 453.0078125 185.4375 A 8 8 0 0 1 445.0078125 193.4375 L 357.1796875 193.4375 L 357.1796875 193.4375 A 8 8 0 0 1 349.1796875 185.4375 L 349.1796875 116.4375 L 349.1796875 116.4375 A 8 8 0 0 1 357.1796875 108.4375 L 401.09375 108.4375 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="401.09375" y="143.4375" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">Create a link </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="401.09375" y="155.9375" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">directly using the </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="401.09375" y="168.4375" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">exact label text </text>                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 401.09375 272.5625 L 409.734375 272.5625 L 409.734375 272.5625 A 8 8 0 0 1 417.734375 280.5625 L 417.734375 302.5625 L 417.734375 302.5625 A 8 8 0 0 1 409.734375 310.5625 L 392.453125 310.5625 L 392.453125 310.5625 A 8 8 0 0 1 384.453125 302.5625 L 384.453125 280.5625 L 384.453125 280.5625 A 8 8 0 0 1 392.453125 272.5625 L 401.09375 272.5625 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="401.09375" y="296.5625" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">or</text>                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 401.09375 391.6875 L 440.4296875 391.6875 L 440.4296875 391.6875 A 8 8 0 0 1 448.4296875 399.6875 L 448.4296875 484.6875 L 448.4296875 484.6875 A 8 8 0 0 1 440.4296875 492.6875 L 361.7578125 492.6875 L 361.7578125 492.6875 A 8 8 0 0 1 353.7578125 484.6875 L 353.7578125 399.6875 L 353.7578125 399.6875 A 8 8 0 0 1 361.7578125 391.6875 L 401.09375 391.6875 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="401.09375" y="428.4375" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">by adding an </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="401.09375" y="440.9375" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">[ID] and </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="401.09375" y="453.4375" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">referencing </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="401.09375" y="465.9375" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">that </text>                  <g transform="scale(0.6666666666666666,0.6666666666666666) translate(-59.02734375,-69.28125)"/>                </g>              </g>            </g>          </g>        </g>      </g>    </g>  </g><!--Original Flowchart Text (flowchart.fun):This app works by typing  Indenting creates a link to the current line  any text: before a colon creates a label  Create a link directly using the exact label text    like this: (This app works by typing)    [custom ID] or      by adding an %5BID%5D and referencing that        like this: (custom ID) // You can also use single-line comments/*ormultilinecommentsHave fun! 🎉*/--></svg>'
    );

    await page.click('button:has-text("Close")');
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

  test.only("can sign up as a sponsor", async () => {
    await page.click('button[role="tab"]:has-text("Sponsors")');

    await page.click('[data-testid="email"]');

    const fakeEmail = `test+${Date.now()}@example.com`;

    await page.fill('[data-testid="email"]', fakeEmail);

    // get iframe name
    const iframeName = await page.evaluate(() => {
      const iframe = document.querySelector("iframe");
      return iframe.name;
    });

    await page
      .frame({
        name: iframeName,
      })
      .click('[placeholder="Card number"]');

    await page
      .frame({
        name: iframeName,
      })
      .fill('[placeholder="Card number"]', "4242 4242 4242 4242");

    await page
      .frame({
        name: iframeName,
      })
      .fill('[placeholder="MM / YY"]', "02 / 24");

    await page
      .frame({
        name: iframeName,
      })
      .fill('[placeholder="CVC"]', "222");

    await page
      .frame({
        name: iframeName,
      })
      .fill('[placeholder="ZIP"]', "22222");

    await page.click('button:has-text("Sign Up")');

    // Expect 'Check your email for a link to log in. You can close this window.' to be in the document
    await expect(
      page.locator(
        "text=Check your email for a link to log in. You can close this window."
      )
    ).toBeVisible({ timeout: 20000 });
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
