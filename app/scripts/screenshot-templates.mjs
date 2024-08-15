import path from "path";
import fs from "fs";
import { chromium } from "playwright";

// Get Directory for Template
const __filename = import.meta.url.slice(7);
const __dirname = path.dirname(__filename);

// Make sure folder to store screenshots exists
const screenshotsDir = path.join(__dirname, "../public/template-screenshots");

async function main() {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    console.log("Created folder: ", screenshotsDir);
  }

  // Get all the templates
  const templates = fs
    .readdirSync(path.join(__dirname, "../src/lib/templates"))
    // remove templates.ts
    .filter((template) => template !== "templates.ts")
    .map((template) => template.replace("-template.ts", ""));

  // const templates = ["flowchart"];

  // Use Playwright to take a screenshot
  const browser = await chromium.launch();

  for (const template of templates) {
    await takeScreenshot(browser, template);
  }

  await browser.close();
}

/**
 * @param {import('playwright').Browser} browser
 * @param {string} template
 */
async function takeScreenshot(browser, template) {
  console.log(`Taking screenshot for ${template}`);
  const page = await browser.newPage();

  // Set a fixed size for the browser window
  await page.setViewportSize({ width: 1000, height: 1000 });

  // go to root page
  await page.goto("http://localhost:3000");

  // execute the global command to load a template
  try {
    await page.evaluate(`window.__load_template__("${template}", true)`);
  } catch (error) {
    console.error("Error loading template", error);
  }

  // wait a few seconds
  await page.waitForTimeout(3000);

  // get the full page link
  const screenshotLink = await page.evaluate(() => {
    return window.__get_screenshot_link__();
  });

  if (!screenshotLink) {
    throw new Error("Screenshot link not found");
  }

  // go to the full page link
  await page.goto(screenshotLink);

  // Capture only the element with data-flowchart-fun-canvas="true"
  const element = await page.$('[data-flowchart-fun-canvas="true"]');
  await element.screenshot({
    path: path.join(screenshotsDir, `${template}.png`),
  });

  console.log(`✅ ${template}.png`);

  await page.close();

  return screenshotLink;
}

main();
