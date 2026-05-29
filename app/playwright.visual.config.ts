import { PlaywrightTestConfig } from "@playwright/test";

/**
 * Visual-regression config — SEPARATE from the e2e config.
 *
 * Unlike e2e (which runs against a Vercel preview), this runs against the LOCAL
 * dev server on :3000 and pixel-diffs the rendered graph for every template
 * against committed golden images. It is the rendering half of the migration
 * safety net: a refactor or framework move that changes how a chart looks will
 * fail here loudly.
 *
 * Chromium-only, single worker, no retries — we want to SEE flakiness, not mask
 * it. Goldens are platform-specific (Playwright suffixes them); these are
 * generated on macOS for now. CI wiring (Linux goldens via Docker) is a
 * deliberate follow-up, not yet covered.
 *
 *   pnpm -F app visual         # compare against goldens (requires dev server on :3000)
 *   pnpm -F app visual:update  # (re)generate goldens
 */
const config: PlaywrightTestConfig = {
  testDir: "e2e/visual",
  testMatch: /.*\.visual\.spec\.ts$/,
  timeout: 120000,
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_START_URL || "http://localhost:3000",
    viewport: { width: 1000, height: 1000 },
    browserName: "chromium",
  },
  expect: {
    toHaveScreenshot: {
      // Small tolerance for anti-aliasing differences. Tuned after the
      // empirical stability check (capture twice, confirm ~zero diff).
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
      animations: "disabled",
      caret: "hide",
    },
  },
};

export default config;
