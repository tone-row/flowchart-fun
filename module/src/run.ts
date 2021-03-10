#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { Command } from "commander";
import { chromium } from "playwright";

// import { generate } from "./generate";
const program = new Command();

program
  .requiredOption("-i, --input <input>", "input text file")
  .requiredOption("-o, --output <output>", "output svg file");

program.parse(process.argv);

const { input, output } = program.opts();
const outputPath = path.resolve(process.cwd(), output);

const text = fs.readFileSync(path.resolve(process.cwd(), input), "utf-8");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  // Open new page
  const page = await context.newPage();

  await page.goto("https://flowchart.fun/?animation=0");

  await page.waitForSelector(".monaco-editor");

  await page.evaluate((t) => {
    // @ts-ignore
    window.flowchartFunSetText(t);
  }, text);

  // await page.waitForTimeout(50);

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
