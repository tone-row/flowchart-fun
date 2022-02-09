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
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 660 543">  <defs/>  <g>    <rect fill="#ffffff" stroke="none" x="0" y="0" width="660" height="543"/>    <g transform="translate(53.10205078125,45.375) scale(1.5,1.5)">      <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 78.89513221153847 184 L 33.21297093976145 261.5268907253819" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>      <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 32.86656280869678 253.54613252789636 L 32.19764122596153 263.25 L 40.36208815328559 257.96281678292604 Z" fill-opacity="1"/>      <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 118.37439903846153 184 L 164.05656031023852 261.5268907253819" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>      <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 156.90744309671442 257.962816782926 L 165.07189002403845 263.25 L 164.40296844130322 253.54613252789636 Z" fill-opacity="1"/>      <g transform="translate(141.46931210280002,223.19422268134548) rotate(59.491588165058495,0,0)">        <rect fill="rgb(255,255,255)" stroke="none" x="-21" y="-8" width="42" height="16" fill-opacity="1"/>        <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="0" y="5" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">any text</text>        <g transform="rotate(-59.491588165058495,0,0) translate(-141.46931210280002,-223.19422268134548)">          <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 123.87025031761047 117 Q 164.7182811373794 62.77441055202077 210.9959357254375 33.78408517960054" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>          <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 207.78312885458436 41.12036130078359 L 212.69083200692813 32.722328806891056 L 203.02778412040783 33.834985781351556 Z" fill-opacity="1"/>          <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 232.86993994904353 37.75 Q 191.75082170418415 92.25731662493114 142.41304398779448 123.11734965212021" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>          <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 145.63787945234176 115.78737557317935 L 140.7174169853298 124.17793867172801 L 150.3821449443759 123.07997078620838 Z" fill-opacity="1"/>          <g transform="translate(189.69615683630158,86.34549572549562) rotate(-43.16395232933465,0,0)">            <rect fill="rgb(255,255,255)" stroke="none" x="-20" y="-8" width="40" height="16" fill-opacity="1"/>            <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="0" y="5" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">like this</text>            <g transform="rotate(43.16395232933465,0,0) translate(-189.69615683630158,-86.34549572549562)">              <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 280.66507244925214 37.75 L 332.8322952055949 115.34026000585851" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>              <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 325.48405017457475 112.20724309494219 L 333.94820880074786 117 L 332.70391914909027 107.35301895602683 Z" fill-opacity="1"/>              <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 365.6340728498932 184 Q 376.4716796875 223.625 366.1617026989951 261.3208533642212" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>              <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 363.52989688373816 253.75342464340667 L 365.6340728498932 263.25 L 371.96882755547483 255.86871401311998 Z" fill-opacity="1"/>              <path fill="none" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 347.3092865251068 263.25 Q 336.4716796875 223.625 346.7816566760049 185.9291466357788" stroke-opacity="1" stroke-linejoin="round" stroke-miterlimit="10"/>              <path fill="rgb(0,0,0)" stroke="none" paint-order="stroke fill markers" d=" M 349.41346249126184 193.49657535659333 L 347.3092865251068 184 L 340.97453181952517 191.38128598688002 Z" fill-opacity="1"/>              <g transform="translate(341.7585756440279,224.1072866589447) rotate(90,0,0)">                <rect fill="rgb(255,255,255)" stroke="none" x="-20" y="-8" width="40" height="16" fill-opacity="1"/>                <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="0" y="5" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">like this</text>                <g transform="rotate(-90,0,0) translate(-341.7585756440279,-224.1072866589447)">                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 98.634765625 117.5 L 132.259765625 117.5 L 132.259765625 117.5 A 8 8 0 0 1 140.259765625 125.5 L 140.259765625 175.5 L 140.259765625 175.5 A 8 8 0 0 1 132.259765625 183.5 L 65.009765625 183.5 L 65.009765625 183.5 A 8 8 0 0 1 57.009765625 175.5 L 57.009765625 125.5 L 57.009765625 125.5 A 8 8 0 0 1 65.009765625 117.5 L 98.634765625 117.5 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="98.634765625" y="149.25" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">This app works </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="98.634765625" y="161.75" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">by typing </text>                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 12.4580078125 263.75 L 50.8173828125 263.75 L 50.8173828125 263.75 A 8 8 0 0 1 58.8173828125 271.75 L 58.8173828125 321.75 L 58.8173828125 321.75 A 8 8 0 0 1 50.8173828125 329.75 L -25.9013671875 329.75 L -25.9013671875 329.75 A 8 8 0 0 1 -33.9013671875 321.75 L -33.9013671875 271.75 L -33.9013671875 271.75 A 8 8 0 0 1 -25.9013671875 263.75 L 12.4580078125 263.75 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="12.4580078125" y="289.25" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">Indenting creates </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="12.4580078125" y="301.75" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">a link to the </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="12.4580078125" y="314.25" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">current line </text>                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 184.8115234375 263.75 L 217.3349609375 263.75 L 217.3349609375 263.75 A 8 8 0 0 1 225.3349609375 271.75 L 225.3349609375 321.75 L 225.3349609375 321.75 A 8 8 0 0 1 217.3349609375 329.75 L 152.2880859375 329.75 L 152.2880859375 329.75 A 8 8 0 0 1 144.2880859375 321.75 L 144.2880859375 271.75 L 144.2880859375 271.75 A 8 8 0 0 1 152.2880859375 263.75 L 184.8115234375 263.75 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="184.8115234375" y="295.5" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">before a colon </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="184.8115234375" y="308" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">creates a label </text>                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 258.1416015625 -28.75 L 295.6650390625 -28.75 L 295.6650390625 -28.75 A 8 8 0 0 1 303.6650390625 -20.75 L 303.6650390625 29.25 L 303.6650390625 29.25 A 8 8 0 0 1 295.6650390625 37.25 L 220.6181640625 37.25 L 220.6181640625 37.25 A 8 8 0 0 1 212.6181640625 29.25 L 212.6181640625 -20.75 L 212.6181640625 -20.75 A 8 8 0 0 1 220.6181640625 -28.75 L 258.1416015625 -28.75 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="258.1416015625" y="-3.25" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">Create a link </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="258.1416015625" y="9.25" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">directly using the </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="258.1416015625" y="21.75" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">exact label text </text>                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 356.4716796875 117.5 L 381.4716796875 117.5 L 381.4716796875 117.5 A 8 8 0 0 1 389.4716796875 125.5 L 389.4716796875 175.5 L 389.4716796875 175.5 A 8 8 0 0 1 381.4716796875 183.5 L 331.4716796875 183.5 L 331.4716796875 183.5 A 8 8 0 0 1 323.4716796875 175.5 L 323.4716796875 125.5 L 323.4716796875 125.5 A 8 8 0 0 1 331.4716796875 117.5 L 356.4716796875 117.5 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="356.4716796875" y="155.5" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">or</text>                  <path fill="rgb(255,255,255)" stroke="rgb(0,0,0)" paint-order="fill stroke markers" d=" M 356.4716796875 263.75 L 394.2763671875 263.75 L 394.2763671875 263.75 A 8 8 0 0 1 402.2763671875 271.75 L 402.2763671875 321.75 L 402.2763671875 321.75 A 8 8 0 0 1 394.2763671875 329.75 L 318.6669921875 329.75 L 318.6669921875 329.75 A 8 8 0 0 1 310.6669921875 321.75 L 310.6669921875 271.75 L 310.6669921875 271.75 A 8 8 0 0 1 318.6669921875 263.75 L 356.4716796875 263.75 Z" fill-opacity="1" stroke-opacity="1" stroke-miterlimit="10"/>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="356.4716796875" y="289.25" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">by adding an [ID] </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="356.4716796875" y="301.75" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">and referencing </text>                  <text fill="rgb(0,0,0)" stroke="none" font-family="Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" font-size="10px" font-style="normal" font-weight="normal" text-decoration="normal" x="356.4716796875" y="314.25" text-anchor="middle" dominant-baseline="text-after-edge" fill-opacity="1">that </text>                  <g transform="scale(0.6666666666666666,0.6666666666666666) translate(-53.10205078125,-45.375)"/>                </g>              </g>            </g>          </g>        </g>      </g>    </g>  </g><!--Original Flowchart Text (flowchart.fun):This app works by typing  Indenting creates a link to the current line  any text: before a colon creates a label  Create a link directly using the exact label text    like this: (This app works by typing)    [custom ID] or      by adding an [ID] and referencing that        like this: (custom ID) // You can also use single-line comments/*ormultilinecommentsHave fun! 🎉*/--></svg>'
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
