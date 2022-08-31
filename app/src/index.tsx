import "./index.css";
import "./slang/slang.css";
import "core-js/features/object/from-entries";
import "core-js/features/object/entries";

import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { Buffer } from "buffer";
import React from "react";
import ReactDOM from "react-dom";

import pkg from "../package.json";
import App from "./components/App";
import reportWebVitals from "./reportWebVitals";

// Fixes Webpack 5 Buffer polyfill issue
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}
window.Buffer = Buffer;

// tmp test to see if lint-staged setup correctly
const x = 1;

Sentry.init({
  release: `flowchartfun@${pkg.version}`,
  dsn: "https://5c0087f5d8ae4a6ab7aa4f42eab785f1@o394152.ingest.sentry.io/5673697",
  integrations: [new Integrations.BrowserTracing()],
  // percentage of transactions to capture for performance monitoring.
  tracesSampleRate: 0.25,
  enabled: process.env.REACT_APP_SENTRY_ENABLED === "1",
  environment: process.env.REACT_APP_SENTRY_ENVIRONMENT ?? "development",
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
