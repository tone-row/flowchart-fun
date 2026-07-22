import { render, screen } from "@testing-library/react";
import { QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { AppContext } from "../components/AppContextProvider";
import { I18n } from "../components/I18n";
import { queryClient } from "../lib/queries";
import { fakePassCustomer, fakeSession } from "../test-utils";
import Account from "./Account";

function renderAccount(customer: unknown) {
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
            <Account />
          </I18n>
        </AppContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("Account page for a 30-Day Pass holder", () => {
  test("shows the pass section with its expiry, without subscription-only sections", () => {
    renderAccount(fakePassCustomer);
    expect(screen.getByText("30-Day Pass")).toBeInTheDocument();
    expect(screen.getByText("Access until")).toBeInTheDocument();
    expect(screen.getByText(/never renews/i)).toBeInTheDocument();
    // Subscription-management UI has nothing to manage for a pass
    expect(screen.queryByText("Customer Portal")).not.toBeInTheDocument();
    expect(screen.queryByText("History")).not.toBeInTheDocument();
    expect(screen.queryByText("Cancel Subscription")).not.toBeInTheDocument();
  });
});
