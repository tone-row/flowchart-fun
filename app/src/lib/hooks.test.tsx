import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

import { AppContext } from "../components/AppContextProvider";
import {
  fakeCustomer,
  fakeExpiredPassCustomer,
  fakeLapsedSubWithPassCustomer,
  fakePassCustomer,
} from "../test-utils";
import {
  useAccountNeedsAttention,
  useCanEdit,
  useHasActivePass,
  useHasProAccess,
  useIsProUser,
  useIsReadOnlyHostedChart,
  useProAiToken,
} from "./hooks";

function contextWrapper(customer: unknown, customerIsLoading = false) {
  return ({ children }: { children: ReactNode }) => (
    <AppContext.Provider
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value={{ customer, customerIsLoading } as any}
    >
      {children}
    </AppContext.Provider>
  );
}

function run<T>(hook: () => T, customer: unknown, customerIsLoading = false) {
  return renderHook(hook, {
    wrapper: contextWrapper(customer, customerIsLoading),
  }).result.current;
}

describe("30-Day Pass entitlement hooks", () => {
  test("active pass grants pro access without a subscription", () => {
    expect(run(useHasActivePass, fakePassCustomer)).toBe(true);
    expect(run(useIsProUser, fakePassCustomer)).toBe(true);
    expect(run(useHasProAccess, fakePassCustomer)).toBe(true);
  });

  test("expired pass grants nothing, even from a stale cache", () => {
    expect(run(useHasActivePass, fakeExpiredPassCustomer)).toBe(false);
    expect(run(useIsProUser, fakeExpiredPassCustomer)).toBe(false);
    expect(run(useHasProAccess, fakeExpiredPassCustomer)).toBe(false);
  });

  test("active subscription still grants pro access", () => {
    expect(run(useIsProUser, fakeCustomer)).toBe(true);
    expect(run(useHasProAccess, fakeCustomer)).toBe(true);
  });

  test("useIsProUser stays undefined while the customer loads", () => {
    expect(run(useIsProUser, undefined, true)).toBeUndefined();
  });
});

describe("useProAiToken", () => {
  test("active subscription sends the subscription id", () => {
    expect(run(useProAiToken, fakeCustomer)).toBe(fakeCustomer.subscription.id);
  });

  test("pass holder sends the payment intent id", () => {
    expect(run(useProAiToken, fakePassCustomer)).toBe(
      fakePassCustomer.pass.paymentIntentId
    );
  });

  test("lapsed subscriber with an active pass sends the pass token, not the dead subscription id", () => {
    expect(run(useProAiToken, fakeLapsedSubWithPassCustomer)).toBe(
      fakeLapsedSubWithPassCustomer.pass.paymentIntentId
    );
  });

  test("free user has no token", () => {
    expect(run(useProAiToken, { customerId: "cus_free" })).toBeUndefined();
  });
});

describe("useAccountNeedsAttention", () => {
  test("past_due subscription alone needs attention", () => {
    const lapsedOnly = {
      customerId: "cus_lapsed",
      subscription: { ...fakeCustomer.subscription, status: "past_due" },
    };
    expect(run(useAccountNeedsAttention, lapsedOnly)).toBeTruthy();
  });

  test("suppressed while a pass is active — the user is paid up", () => {
    expect(run(useAccountNeedsAttention, fakeLapsedSubWithPassCustomer)).toBe(
      false
    );
  });
});

/**
 * Route-aware variant of contextWrapper for hooks that read the location
 * (useCanEdit, useIsReadOnlyHostedChart).
 */
function routeWrapper(
  path: string,
  customer: unknown,
  customerIsLoading = false
) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[path]}>
      <AppContext.Provider
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value={{ customer, customerIsLoading } as any}
      >
        {children}
      </AppContext.Provider>
    </MemoryRouter>
  );
}

function runAt<T>(
  path: string,
  hook: () => T,
  customer: unknown,
  customerIsLoading = false
) {
  return renderHook(hook, {
    wrapper: routeWrapper(path, customer, customerIsLoading),
  }).result.current;
}

const fakeCanceledCustomer = {
  customerId: "cus_canceled",
  subscription: { ...fakeCustomer.subscription, status: "canceled" },
};

const fakePastDueCustomer = {
  customerId: "cus_past_due",
  subscription: { ...fakeCustomer.subscription, status: "past_due" },
};

describe("useIsReadOnlyHostedChart", () => {
  test("hosted chart with a canceled subscription is read-only", () => {
    expect(runAt("/u/123", useCanEdit, fakeCanceledCustomer)).toBe(false);
    expect(
      runAt("/u/123", useIsReadOnlyHostedChart, fakeCanceledCustomer)
    ).toBe(true);
  });

  test("hosted chart with an active subscription is editable", () => {
    expect(runAt("/u/123", useCanEdit, fakeCustomer)).toBe(true);
    expect(runAt("/u/123", useIsReadOnlyHostedChart, fakeCustomer)).toBe(false);
  });

  test("hosted chart with an active 30-Day Pass is editable", () => {
    expect(runAt("/u/123", useCanEdit, fakePassCustomer)).toBe(true);
    expect(runAt("/u/123", useIsReadOnlyHostedChart, fakePassCustomer)).toBe(
      false
    );
  });

  test("hosted chart with an expired pass is read-only", () => {
    expect(runAt("/u/123", useCanEdit, fakeExpiredPassCustomer)).toBe(false);
    expect(
      runAt("/u/123", useIsReadOnlyHostedChart, fakeExpiredPassCustomer)
    ).toBe(true);
  });

  test("never flashes read-only while the customer is loading", () => {
    expect(runAt("/u/123", useCanEdit, undefined, true)).toBeUndefined();
    expect(runAt("/u/123", useIsReadOnlyHostedChart, undefined, true)).toBe(
      false
    );
  });

  test("past_due keeps edit access, matching ThemeTab/Graph today", () => {
    expect(runAt("/u/123", useCanEdit, fakePastDueCustomer)).toBe(true);
    expect(runAt("/u/123", useIsReadOnlyHostedChart, fakePastDueCustomer)).toBe(
      false
    );
  });

  test("sandbox is always editable, even for lapsed users", () => {
    expect(runAt("/", useCanEdit, fakeCanceledCustomer)).toBe(true);
    expect(runAt("/", useIsReadOnlyHostedChart, fakeCanceledCustomer)).toBe(
      false
    );
  });

  test("route-based read-only pages are not hosted-read-only", () => {
    expect(
      runAt("/c/abc", useIsReadOnlyHostedChart, fakeCanceledCustomer)
    ).toBe(false);
  });
});
