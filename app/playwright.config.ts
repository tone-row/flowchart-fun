import { PlaywrightTestConfig } from "@playwright/test";
import merge from "deepmerge";

let config: PlaywrightTestConfig = {
  testDir: "e2e",
  use: {
    acceptDownloads: true,
    viewport: {
      width: 1200,
      height: 1080,
    },
  },
};

const devConfig: PlaywrightTestConfig = {
  use: { headless: false, launchOptions: { slowMo: 10 } },
};

if (!process.env.CI) {
  config = merge(config, devConfig);
}

export default config;
