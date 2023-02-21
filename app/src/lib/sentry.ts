import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

import pkg from "../../package.json";

export function initSentry() {
  Sentry.init({
    release: `flowchartfun@${pkg.version}`,
    dsn: "https://5c0087f5d8ae4a6ab7aa4f42eab785f1@o394152.ingest.sentry.io/5673697",
    // percentage of transactions to capture for performance monitoring.
    tracesSampleRate: 0.25,
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,
    // If the entire session is not sampled, use the below sample rate to sample
    // sessions when an error occurs.
    replaysOnErrorSampleRate: 1.0,
    integrations: [new Integrations.BrowserTracing(), new Sentry.Replay()],
    enabled: process.env.REACT_APP_SENTRY_ENABLED === "1",
    environment: process.env.REACT_APP_SENTRY_ENVIRONMENT ?? "development",
  });
}

export function logError(error: Error) {
  Sentry.captureException(error);
}
