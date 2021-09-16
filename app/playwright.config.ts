import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  timeout: 5000,
  use: {
    acceptDownloads: true,
    viewport: {
      width: 1200,
      height: 1080,
    },
  },
};

export default config;
