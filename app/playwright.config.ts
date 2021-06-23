import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  use: {
    acceptDownloads: true,
  },
};

export default config;
