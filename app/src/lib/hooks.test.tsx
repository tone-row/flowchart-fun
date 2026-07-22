import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";

import { AppContext } from "../components/AppContextProvider";
import {
  fakeCustomer,
  fakeExpiredPassCustomer,
  fakeLapsedSubWithPassCustomer,
  fakePassCustomer,
} from "../test-utils";
import {
  useAccountNeedsAttention,
  useHasActivePass,
  useHasProAccess,
  useIsProUser,
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
