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
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 658.5 762">  <defs/>  <g>    <rect fill="#ffffff" stroke="none" x="0" y="0" width="658.5" height="762"/>    <g transform="translate(53.04931640625,67.3125) scale(1.5,1.5)">      <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 157.74504461332492 20.9565065175575 L 55.750552517680575 101.65118207487006" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>      <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 58.30592719518287 94.08265776311814 L 54.18207953525908 102.89210612710444 L 63.7039468224024 100.90551523665168 Z" fill-opacity="1"/>      <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 194.48343182425214 23.125 L 187.88024675127278 100.38226535385853" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>      <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 184.11661821767353 93.33616002814294 L 187.70992755074786 102.375 L 192.7850139283889 94.0770485504263 Z" fill-opacity="1"/>      <g transform="translate(191.1392594876312,62.251816338464636) rotate(-85.1147974318827,0,0)">        <rect fill="rgb(255,255,255)" stroke="none" x="-21" y="-8" width="42" height="16" fill-opacity="1"/>        <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="0" y="5" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">any text</text>        <g transform="rotate(85.1147974318827,0,0) translate(-191.1392594876312,-62.251816338464636)">          <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 239.41851829441822 16.045736746086256 Q 290.1641485385485 47.913536730323955 329.822412901962 100.7751748594374" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>          <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 322.2611331915966 98.15026413971212 L 331.02264601249675 102.375 L 329.14552700818695 92.83094822710716 Z" fill-opacity="1"/>          <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 310.7398410573764 107.31584788017551 Q 263.06723080264874 77.33728647800031 223.64662092730484 24.72555745482952" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>          <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 231.20304986943486 27.361800062250722 L 222.447364560305 23.125 L 224.31133569598234 32.67162828465432 Z" fill-opacity="1"/>          <g transform="translate(265.1302308974947,71.6789945727514) rotate(43.637771346519955,0,0)">            <rect fill="rgb(255,255,255)" stroke="none" x="-20" y="-8" width="40" height="16" fill-opacity="1"/>            <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="0" y="5" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">like this</text>            <g transform="rotate(-43.637771346519955,0,0) translate(-265.1302308974947,-71.6789945727514)">              <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 356.1552734375 169.375 L 356.1552734375 246.625" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>              <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 351.8052734375 239.925 L 356.1552734375 248.625 L 360.5052734375 239.925 Z" fill-opacity="1"/>              <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 365.3176665998932 315.625 Q 376.1552734375 355.25 365.8452964489951 392.9458533642212" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>              <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 363.21349063373816 385.3784246434067 L 365.3176665998932 394.875 L 371.65242130547483 387.49371401312 Z" fill-opacity="1"/>              <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 346.9928802751068 394.875 Q 336.1552734375 355.25 346.4652504260049 317.5541466357788" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>              <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 349.09705624126184 325.1215753565933 L 346.9928802751068 315.625 L 340.65812556952517 323.00628598688 Z" fill-opacity="1"/>              <g transform="translate(341.4421693940279,355.7322866589447) rotate(90,0,0)">                <rect fill="rgb(255,255,255)" stroke="none" x="-20" y="-8" width="40" height="16" fill-opacity="1"/>                <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="0" y="5" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">like this</text>                <g transform="rotate(-90,0,0) translate(-341.4421693940279,-355.7322866589447)">                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 197.3466796875 -43.375 L 230.9716796875 -43.375 L 230.9716796875 -43.375 A 8 8 0 0 1 238.9716796875 -35.375 L 238.9716796875 14.625 L 238.9716796875 14.625 A 8 8 0 0 1 230.9716796875 22.625 L 163.7216796875 22.625 L 163.7216796875 22.625 A 8 8 0 0 1 155.7216796875 14.625000000000002 L 155.7216796875 -35.375 L 155.7216796875 -35.375 A 8 8 0 0 1 163.7216796875 -43.375 L 197.3466796875 -43.375 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="197.3466796875" y="-11.625" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">This app works </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="197.3466796875" y="0.875" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">by typing </text>                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 12.4931640625 102.875 L 50.8525390625 102.875 L 50.8525390625 102.875 A 8 8 0 0 1 58.8525390625 110.875 L 58.8525390625 160.875 L 58.8525390625 160.875 A 8 8 0 0 1 50.8525390625 168.875 L -25.8662109375 168.875 L -25.8662109375 168.875 A 8 8 0 0 1 -33.8662109375 160.875 L -33.8662109375 110.875 L -33.8662109375 110.875 A 8 8 0 0 1 -25.8662109375 102.875 L 12.4931640625 102.875 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="12.4931640625" y="128.375" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">Indenting creates </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="12.4931640625" y="140.875" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">a link to the </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="12.4931640625" y="153.375" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">current line </text>                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 184.8466796875 102.875 L 217.3701171875 102.875 L 217.3701171875 102.875 A 8 8 0 0 1 225.3701171875 110.875 L 225.3701171875 160.875 L 225.3701171875 160.875 A 8 8 0 0 1 217.3701171875 168.875 L 152.3232421875 168.875 L 152.3232421875 168.875 A 8 8 0 0 1 144.3232421875 160.875 L 144.3232421875 110.875 L 144.3232421875 110.875 A 8 8 0 0 1 152.3232421875 102.875 L 184.8466796875 102.875 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="184.8466796875" y="134.625" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">before a colon </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="184.8466796875" y="147.125" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">creates a label </text>                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 356.1552734375 102.875 L 393.6787109375 102.875 L 393.6787109375 102.875 A 8 8 0 0 1 401.6787109375 110.875 L 401.6787109375 160.875 L 401.6787109375 160.875 A 8 8 0 0 1 393.6787109375 168.875 L 318.6318359375 168.875 L 318.6318359375 168.875 A 8 8 0 0 1 310.6318359375 160.875 L 310.6318359375 110.875 L 310.6318359375 110.875 A 8 8 0 0 1 318.6318359375 102.875 L 356.1552734375 102.875 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="356.1552734375" y="128.375" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">Create a link </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="356.1552734375" y="140.875" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">directly using the </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="356.1552734375" y="153.375" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">exact label text </text>                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 356.1552734375 249.125 L 381.1552734375 249.125 L 381.1552734375 249.125 A 8 8 0 0 1 389.1552734375 257.125 L 389.1552734375 307.125 L 389.1552734375 307.125 A 8 8 0 0 1 381.1552734375 315.125 L 331.1552734375 315.125 L 331.1552734375 315.125 A 8 8 0 0 1 323.1552734375 307.125 L 323.1552734375 257.125 L 323.1552734375 257.125 A 8 8 0 0 1 331.1552734375 249.125 L 356.1552734375 249.125 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="356.1552734375" y="287.125" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">or</text>                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 356.1552734375 395.375 L 392.2880859375 395.375 L 392.2880859375 395.375 A 8 8 0 0 1 400.2880859375 403.375 L 400.2880859375 453.375 L 400.2880859375 453.375 A 8 8 0 0 1 392.2880859375 461.375 L 320.0224609375 461.375 L 320.0224609375 461.375 A 8 8 0 0 1 312.0224609375 453.375 L 312.0224609375 403.375 L 312.0224609375 403.375 A 8 8 0 0 1 320.0224609375 395.375 L 356.1552734375 395.375 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="356.1552734375" y="420.875" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">by adding an [ID] </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="356.1552734375" y="433.375" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">and referencing </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="356.1552734375" y="445.875" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">that </text>                  <g transform="scale(0.6666666666666666,0.6666666666666666) translate(-53.04931640625,-67.3125)"/>                </g>              </g>            </g>          </g>        </g>      </g>    </g>  </g><!--Original Flowchart Text (flowchart.fun):This app works by typing  Indenting creates a link to the current line  any text: before a colon creates a label  Create a link directly using the exact label text    like this: (This app works by typing)    [custom ID] or      by adding an %5BID%5D and referencing that        like this: (custom ID) // You can also use single-line comments/*ormultilinecommentsHave fun! 🎉*/--></svg>'
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
});

function streamToString(stream: Stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}
