import * as Sentry from "@sentry/react";
import { Elements } from "@stripe/react-stripe-js";
import { render, RenderOptions } from "@testing-library/react";
import { createMemoryHistory } from "history";
import React, { FC, ReactElement, Suspense } from "react";
import { QueryClientProvider } from "react-query";
import { Router } from "react-router-dom";

import { ErrorFallback, stripePromise } from "./components/App";
import Provider from "./components/AppContext";
import { I18n } from "./components/I18n";
import Loading from "./components/Loading";
import { queryClient } from "./lib/queries";

export const history = createMemoryHistory();

const AllTheProviders: FC = ({ children }) => {
  return (
    <Router history={history}>
      <QueryClientProvider client={queryClient}>
        <Provider>
          <Sentry.ErrorBoundary fallback={ErrorFallback}>
            <I18n>
              <Elements stripe={stripePromise}>
                <Suspense fallback={<Loading />}>{children}</Suspense>
              </Elements>
            </I18n>
          </Sentry.ErrorBoundary>
        </Provider>
      </QueryClientProvider>
    </Router>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
