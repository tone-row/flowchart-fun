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
    // headless: false,
    // launchOptions: { slowMo: 10 },
  },
};

export default config;
