import { PlaywrightTestConfig } from "@playwright/test";

const isDebug = !!process.env.DEBUG;

const isCI = !!process.env.CI;
console.log("isCI", isCI);

// import .env if CI, or .env.e2e if not
const envPath = isCI ? ".env" : ".env.e2e";
console.log("envPath", envPath);

// import dotenv
import dotenv from "dotenv";
dotenv.config({ path: envPath });

const config: PlaywrightTestConfig = {
  testDir: "e2e",
  workers: 6,
  timeout: 120000,
  use: {
    acceptDownloads: true,
    viewport: {
      width: 1200,
      height: 1080,
    },
    // Development
    headless: isDebug ? false : true,
    launchOptions: {
      slowMo: isDebug ? 500 : 0,
    },
  },
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
