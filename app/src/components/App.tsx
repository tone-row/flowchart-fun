import * as Sentry from "@sentry/react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React, { Suspense } from "react";
import { QueryClientProvider } from "react-query";

import { queryClient } from "../lib/queries";
import { Box, Type } from "../slang";
import Provider from "./AppContext";
import { I18n } from "./I18n";
import Router from "./Router";

export const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_KEY as string
);

import { t } from "@lingui/macro";
import { ReactQueryDevtools } from "react-query/devtools";
import { BrowserRouter } from "react-router-dom";

import Loading from "./Loading";
import { Button } from "./Shared";

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Provider>
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
        </Provider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export function ErrorFallback({ error }: { error: Error }) {
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
