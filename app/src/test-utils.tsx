import { Provider as TooltipProvider } from "@radix-ui/react-tooltip";
import * as Sentry from "@sentry/react";
import { Elements } from "@stripe/react-stripe-js";
import { Session } from "@supabase/supabase-js";
import { render, renderHook, RenderOptions } from "@testing-library/react";
import { ReactElement, ReactNode, Suspense } from "react";
import { act } from "react-dom/test-utils";
import { QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { ErrorFallback, stripePromise } from "./components/App";
import Provider from "./components/AppContextProvider";
import { I18n } from "./components/I18n";
import Loading from "./components/Loading";
import { queryClient } from "./lib/queries";

const Wrapper = ({ children }: { children: ReactNode }) => {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <QueryClientProvider client={queryClient}>
        <Provider>
          <I18n>
            <Sentry.ErrorBoundary fallback={ErrorFallback}>
              <Elements stripe={stripePromise}>
                <Suspense fallback={<Loading />}>
                  <TooltipProvider>{children}</TooltipProvider>
                </Suspense>
              </Elements>
            </Sentry.ErrorBoundary>
          </I18n>
        </Provider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: Wrapper, ...options });

const customRenderHook = <A, B>(hook: (props: A) => B) =>
  renderHook(hook, { wrapper: Wrapper });

export * from "@testing-library/react";
export { customRender as render, customRenderHook as renderHook, act };

// Wait for all queueMicrotask() callbacks
export function flushMicrotasks() {
  return act(() => Promise.resolve());
}

// Wait for all requestAnimationFrame() callbacks
export function nextFrame() {
  return act(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  );
}

// Wait for setTimeout() callbacks
export async function sleep(ms: number) {
  await act(() => new Promise((resolve) => setTimeout(resolve, ms)));
  await nextFrame();
}

export const fakeSession: Session = {
  access_token: "xxx",
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "xxx",
  user: {
    id: "xxx",
    aud: "authenticated",
    role: "authenticated",
    email: "xxx@xxx.com",
    email_confirmed_at: "2021-10-04T12:16:50.331104Z",
    phone: "",
    confirmation_sent_at: "2021-10-04T12:16:41.57251Z",
    confirmed_at: "2021-10-04T12:16:50.331104Z",
    recovery_sent_at: "2022-09-01T13:14:08.841269Z",
    last_sign_in_at: "2022-09-01T13:14:14.957605Z",
    app_metadata: {
      provider: "email",
    },
    user_metadata: {},
    identities: [],
    created_at: "2021-10-04T12:16:41.569754Z",
    updated_at: "2022-09-01T17:15:20.043769Z",
  },
  expires_at: 1662056120,
};

export const mockGetSessionReturn = {
  data: { session: fakeSession },
  error: null,
};

export const fakeCustomer = {
  customerId: "xxx",
  subscription: {
    id: "sub_xxx",
    object: "subscription",
    application: null,
    application_fee_percent: null,
    automatic_tax: {
      enabled: false,
    },
    billing: "charge_automatically",
    billing_cycle_anchor: 1653673556,
    billing_thresholds: null,
    cancel_at: null,
    cancel_at_period_end: false,
    canceled_at: null,
    collection_method: "charge_automatically",
    created: 1653673556,
    currency: "usd",
    current_period_end: 1685209556,
    current_period_start: 1653673556,
    customer: "cus_xxx",
    days_until_due: null,
    default_payment_method: null,
    default_source: null,
    default_tax_rates: [],
    description: null,
    discount: null,
    ended_at: null,
    invoice_customer_balance_settings: {
      consume_applied_balance_on_void: true,
    },
    items: {
      object: "list",
      data: [
        {
          id: "si_xxx",
          object: "subscription_item",
          billing_thresholds: null,
          created: 1653673557,
          metadata: {},
          plan: {
            id: "price_xxx",
            object: "plan",
            active: true,
            aggregate_usage: null,
            amount: 1000,
            amount_decimal: "1000",
            billing_scheme: "per_unit",
            created: 1646690520,
            currency: "usd",
            interval: "year",
            interval_count: 1,
            livemode: false,
            metadata: {},
            nickname: null,
            product: "prod_xxx",
            tiers: null,
            tiers_mode: null,
            transform_usage: null,
            trial_period_days: null,
            usage_type: "licensed",
          },
          price: {
            id: "price_xxx",
            object: "price",
            active: true,
            billing_scheme: "per_unit",
            created: 1646690520,
            currency: "usd",
            custom_unit_amount: null,
            livemode: false,
            lookup_key: null,
            metadata: {},
            nickname: null,
            product: "prod_xxx",
            recurring: {
              aggregate_usage: null,
              interval: "year",
              interval_count: 1,
              trial_period_days: null,
              usage_type: "licensed",
            },
            tax_behavior: "unspecified",
            tiers_mode: null,
            transform_quantity: null,
            type: "recurring",
            unit_amount: 1000,
            unit_amount_decimal: "1000",
          },
          quantity: 1,
          subscription: "sub_xxx",
          tax_rates: [],
        },
      ],
      has_more: false,
      total_count: 1,
      url: "/v1/subscription_items?subscription=sub_xxx",
    },
    latest_invoice: "in_xxx",
    livemode: false,
    metadata: {},
    next_pending_invoice_item_invoice: null,
    pause_collection: null,
    payment_settings: {
      payment_method_options: null,
      payment_method_types: null,
      save_default_payment_method: "off",
    },
    pending_invoice_item_interval: null,
    pending_setup_intent: null,
    pending_update: null,
    plan: {
      id: "price_xxx",
      object: "plan",
      active: true,
      aggregate_usage: null,
      amount: 1000,
      amount_decimal: "1000",
      billing_scheme: "per_unit",
      created: 1646690520,
      currency: "usd",
      interval: "year",
      interval_count: 1,
      livemode: false,
      metadata: {},
      nickname: null,
      product: "prod_xxx",
      tiers: null,
      tiers_mode: null,
      transform_usage: null,
      trial_period_days: null,
      usage_type: "licensed",
    },
    quantity: 1,
    schedule: null,
    start: 1653673556,
    start_date: 1653673556,
    status: "active",
    tax_percent: null,
    test_clock: null,
    transfer_data: null,
    trial_end: null,
    trial_start: null,
  },
};

export const fakeMakeCartResponse = {
  error: null,
  data: [
    {
      id: 84,
      created_at: "2022-09-01T18:17:55.828104+00:00",
      user_id: "xxx",
      chart:
        "This app works by typing\n  Indenting creates a link to the current line\n  any text: before a colon creates a label\n  Create a link directly using the exact label text\n    like this: (This app works by typing)\n    [custom ID] or\n      by adding an %5BID%5D and referencing that\n        like this: (custom ID) // You can also use single-line comments\n/*\nor\nmultiline\ncomments\n\nHave fun! 🎉\n*/",
      updated_at: "2022-09-01T18:17:55.828104+00:00",
      name: "hm4vj",
      is_public: false,
    },
  ],
  count: null,
  status: 201,
  statusText: "",
  body: [
    {
      id: 84,
      created_at: "2022-09-01T18:17:55.828104+00:00",
      user_id: "xxx",
      chart:
        "This app works by typing\n  Indenting creates a link to the current line\n  any text: before a colon creates a label\n  Create a link directly using the exact label text\n    like this: (This app works by typing)\n    [custom ID] or\n      by adding an %5BID%5D and referencing that\n        like this: (custom ID) // You can also use single-line comments\n/*\nor\nmultiline\ncomments\n\nHave fun! 🎉\n*/",
      updated_at: "2022-09-01T18:17:55.828104+00:00",
      name: "hm4vj",
      is_public: false,
    },
  ],
};
