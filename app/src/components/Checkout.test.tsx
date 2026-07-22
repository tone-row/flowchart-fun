import { render, screen } from "@testing-library/react";
import { ReactNode } from "react";
import { QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { queryClient } from "../lib/queries";
import { fakeCustomer, fakePassCustomer, fakeSession } from "../test-utils";
import { AppContext } from "./AppContextProvider";
import { Checkout } from "./Checkout";
import { I18n } from "./I18n";

function renderCheckout(customer: unknown) {
  const value = {
    session: fakeSession,
    checkedSession: true,
    customerIsLoading: false,
    customer,
    language: "en",
  };
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <AppContext.Provider value={value as any}>
          <I18n>
            <Checkout />
          </I18n>
        </AppContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("Checkout with the 30-Day Pass", () => {
  test("logged-in free user sees plan buttons and the pass callout", () => {
    renderCheckout({ customerId: "cus_free" });
    expect(screen.getByTestId("yearly-plan-button")).toBeInTheDocument();
    expect(screen.getByTestId("monthly-plan-button")).toBeInTheDocument();
    expect(screen.getByTestId("pass-button")).toBeInTheDocument();
  });

  test("pass holder keeps the subscription options but loses the pass callout", () => {
    renderCheckout(fakePassCustomer);
    expect(screen.getByText(/active 30-Day Pass until/i)).toBeInTheDocument();
    expect(screen.getByTestId("yearly-plan-button")).toBeInTheDocument();
    expect(screen.getByTestId("monthly-plan-button")).toBeInTheDocument();
    expect(screen.queryByTestId("pass-button")).not.toBeInTheDocument();
  });

  test("subscriber sees the existing already-pro message", () => {
    renderCheckout(fakeCustomer);
    expect(screen.getByText(/already a Pro User/i)).toBeInTheDocument();
    expect(screen.queryByTestId("pass-button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("yearly-plan-button")).not.toBeInTheDocument();
  });
});
