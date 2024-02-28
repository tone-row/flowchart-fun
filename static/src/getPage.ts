import chromium from "@sparticuz/chromium-min";
import puppeteer, { Browser, Page } from "puppeteer-core";
let page: Page;
let browser: Browser;

async function getBrowser() {
  // local development is broken for this 👇
  // but it works in vercel so I'm not gonna touch it
  return puppeteer.launch({
    args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: chromium.defaultViewport,
    executablePath:
      "/Users/robgordon/Dev/flowchart-fun/static/tmp/chromium/chromium/mac_arm-1266189/chrome-mac/Chromium.app/Contents/MacOS/Chromium",
    headless: true,
    ignoreHTTPSErrors: true,
  });
}

/**
 * Gets a puppeteer page
 */
export async function getPage() {
  try {
    if (page && browser) return { page, browser };

    browser = await getBrowser();
    page = await browser.newPage();
    page.setJavaScriptEnabled(true);
    return { page, browser };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get page.");
  }
}
