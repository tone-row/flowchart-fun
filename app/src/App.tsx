import Router from "./components/Router";
import * as Sentry from "@sentry/react";
import React, { Suspense } from "react";
import Provider from "./components/AppContext";
import { Box, Type } from "./slang";
import { I18n } from "./components/I18n";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { QueryClientProvider } from "react-query";
import { queryClient } from "./lib/queries";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY as string);

import { ReactQueryDevtools } from "react-query/devtools";
import { Button } from "./components/Shared";
import { BrowserRouter } from "react-router-dom";
import { t } from "@lingui/macro";
import Loading from "./components/Loading";
import { UserSettingsProvider } from "./components/SettingsContext";

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Provider>
          <UserSettingsProvider>
            <Sentry.ErrorBoundary fallback={ErrorFallback}>
              <I18n>
                <Elements stripe={stripePromise}>
                  <Suspense fallback={<Loading />}>
                    <Router />
                    <ReactQueryDevtools />
                  </Suspense>
                </Elements>
              </I18n>
            </Sentry.ErrorBoundary>
          </UserSettingsProvider>
        </Provider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="errorWrapper">
      <Box role="alert" className="error-wrapper">
        <Type>
          Sorry! Something went wrong.{" "}
          <span role="img" aria-label="Sad face emoji">
            😔
          </span>
        </Type>
        <div className="errorMessage">
          <pre>{error.message}</pre>
        </div>
        <Box flow="column" gap={2}>
          <Button
            onClick={() => window.location.reload()}
            text={t`Try again`}
          />
          <Button
            onClick={() => {
              location.href = "/";
            }}
            text={t`Home`}
          />
        </Box>
      </Box>
    </div>
  );
}
