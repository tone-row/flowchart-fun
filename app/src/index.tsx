import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import "./index.css";
import "./slang/slang.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

Sentry.init({
  dsn:
    "https://5c0087f5d8ae4a6ab7aa4f42eab785f1@o394152.ingest.sentry.io/5673697",
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
