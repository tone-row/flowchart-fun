import { Provider as TooltipProvider } from "@radix-ui/react-tooltip";
import * as Sentry from "@sentry/react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Suspense } from "react";
import { QueryClientProvider } from "react-query";

import { queryClient } from "../lib/queries";
import { Box } from "../slang";
import Provider from "./AppContextProvider";
import { I18n } from "./I18n";
import Router from "./Router";

export const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_KEY as string
);

import { Trans } from "@lingui/macro";
import { House, Recycle } from "phosphor-react";
import { ReactQueryDevtools } from "react-query/devtools";
import { BrowserRouter } from "react-router-dom";

import { Button2 } from "../ui/Shared";
import Loading from "./Loading";
import { pageHeight } from "./pageHeight";

pageHeight();

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Provider>
          <I18n>
            <Sentry.ErrorBoundary fallback={ErrorFallback}>
              <Elements stripe={stripePromise}>
                <Suspense fallback={<Loading />}>
                  <TooltipProvider>
                    <Router />
                  </TooltipProvider>
                  <ReactQueryDevtools />
                </Suspense>
              </Elements>
            </Sentry.ErrorBoundary>
          </I18n>
        </Provider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="errorWrapper">
      <Box role="alert" className="error-wrapper">
        <span className="text-4xl">
          Sorry! Something went wrong.{" "}
          <span role="img" aria-label="Sad face emoji">
            😔
          </span>
        </span>
        <div className="errorMessage">
          <pre>{error.message}</pre>
        </div>
        <Box flow="column" gap={2}>
          <Button2
            onClick={() => window.location.reload()}
            color="blue"
            leftIcon={<Recycle size={16} />}
          >
            <Trans>Try again</Trans>
          </Button2>
          <Button2
            onClick={() => {
              location.href = "/";
            }}
            leftIcon={<House size={16} />}
          >
            <Trans>Home</Trans>
          </Button2>
        </Box>
      </Box>
    </div>
  );
}
