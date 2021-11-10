import React, { FC, ReactElement, Suspense } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "react-query";
import { queryClient } from "./lib/queries";
import Provider from "./components/AppContext";
import * as Sentry from "@sentry/react";
import { I18n } from "./components/I18n";
import { Elements } from "@stripe/react-stripe-js";
import { ErrorFallback, stripePromise } from "./App";
import Loading from "./components/Loading";

const AllTheProviders: FC = ({ children }) => {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
