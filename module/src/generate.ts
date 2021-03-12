import { chromium } from "playwright";

export default function generate({
  text,
  outputPath,
}: {
  text: string;
  outputPath: string;
}) {
  (async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ acceptDownloads: true });
    // Open new page
    const page = await context.newPage();

    await page.goto(
      `https://flowchart.fun/r/${encodeURIComponent(text)}?animation=0`
    );

    await page.waitForSelector(".monaco-editor");

    // Click text=Download SVG
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click("text=Download SVG"),
    ]);

    await download.saveAs(outputPath);
    // ---------------------
    await context.close();
    await browser.close();
  })();
}
