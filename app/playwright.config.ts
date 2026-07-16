import { PlaywrightTestConfig } from "@playwright/test";

const isDebug = !!process.env.DEBUG;

const isCI = !!process.env.CI;

// import .env if CI, or .env.e2e if not
const envPath = isCI ? ".env" : ".env.e2e";

// import dotenv
import dotenv from "dotenv";
dotenv.config({ path: envPath });

const config: PlaywrightTestConfig = {
  testDir: "e2e",
  // Visual-regression specs live under e2e/visual and run via their own
  // playwright.visual.config.ts (local-only, platform-specific goldens). Keep
  // them OUT of the e2e suite — they'd otherwise run against the Linux preview
  // in CI with no matching goldens and fail.
  testIgnore: "**/visual/**",
  timeout: 120000,
  workers: 12,
  use: {
    acceptDownloads: true,
    viewport: {
      width: 1200,
      height: 1080,
    },
    // Development
    // headless: isDebug ? false : true,
    launchOptions: {
      slowMo: isDebug ? 500 : 0,
    },
  },
  maxFailures: 3,
  // E2E runs against a live Vercel preview; some flows (notably the CSV-import
  // confirmation in pro.spec) are timing-sensitive there. Retry in CI so a
  // one-off flake doesn't redden the whole PR — a real break still fails every
  // attempt. Locally retries stay off so flakes stay visible while developing.
  retries: isCI ? 2 : 0,
  projects: isDebug
    ? [
        {
          name: "Chromium",
          use: {
            browserName: "chromium",
          },
        },
      ]
    : [
        {
          name: "Chromium",
          use: {
            browserName: "chromium",
          },
        },
        {
          name: "Firefox",
          use: {
            browserName: "firefox",
          },
        },
      ],
};

export default config;
