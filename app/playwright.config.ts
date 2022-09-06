import "dotenv/config";

import { PlaywrightTestConfig } from "@playwright/test";

const isDebug = !!process.env.DEBUG;

const config: PlaywrightTestConfig = {
  testDir: "e2e",
  workers: 6,
  timeout: 90000,
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
