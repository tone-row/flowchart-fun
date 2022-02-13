import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "e2e",
  use: {
    acceptDownloads: true,
    viewport: {
      width: 1200,
      height: 1080,
    },
    // Development
    headless: process.env.HEADLESS === "0" ? false : true,
  },
  // timeout: 60000,
};

export default config;
