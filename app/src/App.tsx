import Router from "./components/Router";
import * as Sentry from "@sentry/react";
import React, { Suspense } from "react";
import Provider from "./components/AppContext";
import { Box, Type } from "./slang";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { messages } from "./locales/fr/messages.js";

i18n.load("en", messages);
i18n.activate("en");

export default function App() {
  return (
    <I18nProvider i18n={i18n}>
      <Provider>
        <Sentry.ErrorBoundary fallback={ErrorFallback}>
          <Suspense fallback={null}>
            <Router />
          </Suspense>
        </Sentry.ErrorBoundary>
      </Provider>
    </I18nProvider>
  );
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="errorWrapper">
      <Box role="alert" className="error-wrapper">
        <Type>Sorry! Something went wrong. 😔</Type>
        <div className="errorMessage">
          <pre>{error.message}</pre>
        </div>
        <button onClick={() => window.location.reload()}>Try again</button>
      </Box>
    </div>
  );
}
