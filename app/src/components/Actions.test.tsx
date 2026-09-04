import { render, screen } from "@testing-library/react";
import { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

import { fakeCustomer } from "../test-utils";
import { AppContext } from "./AppContextProvider";
import { Actions } from "./Actions";
import { I18n } from "./I18n";

const fakeCanceledCustomer = {
  customerId: "cus_canceled",
  subscription: { ...fakeCustomer.subscription, status: "canceled" },
};

function wrapper(path: string, customer: unknown) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[path]}>
      <AppContext.Provider
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value={{ customer, customerIsLoading: false, language: "en" } as any}
      >
        <I18n>{children}</I18n>
      </AppContext.Provider>
    </MemoryRouter>
  );
}

describe("Actions on a hosted chart", () => {
  test("hides the Examples button when the user can no longer edit", () => {
    render(<Actions />, { wrapper: wrapper("/u/123", fakeCanceledCustomer) });
    expect(screen.queryByText("Examples")).not.toBeInTheDocument();
    // informational dialogs stay available
    expect(screen.getAllByText("Learn Syntax").length).toBeGreaterThan(0);
  });

  test("shows the Examples button for an active subscriber", () => {
    render(<Actions />, { wrapper: wrapper("/u/123", fakeCustomer) });
    expect(screen.getAllByText("Examples").length).toBeGreaterThan(0);
  });
});
