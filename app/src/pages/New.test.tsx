import * as RQ from "react-query";

import * as cy from "../lib/cytoscape";
import * as helpers from "../lib/helpers";
import * as hooks from "../lib/hooks";
import * as queries from "../lib/queries";
import { supabase } from "../lib/supabaseClient";
import {
  fakeCustomer,
  fakeMakeCartResponse,
  fakeSession,
  nextFrame,
  render,
} from "../test-utils";
import { New } from "./New";
const fakeName = "fake-name";

jest.mock("../lib/supabaseClient", () => ({
  supabase: {
    auth: {
      session: jest.fn(() => null),
      onAuthStateChange: jest.fn(),
    },
  },
}));

describe.only("New Page", () => {
  it("shoud render", async () => {
    render(<New />);
    await nextFrame();
  });

  it("should foward to new local chart if not logged in", async () => {
    const mock = jest.spyOn(helpers, "randomChartName");
    mock.mockReturnValue(fakeName);
    render(<New />);
    await nextFrame();
    expect(window.location.pathname).toEqual(`/${fakeName}`);
  });

  it("should create a hosted chart if logged in", async () => {
    // Make sure we have a supabase session
    if (!supabase) throw new Error("supabase is undefined");
    const mockGetSession = jest.spyOn(supabase.auth, "session");
    mockGetSession.mockReturnValue(fakeSession);

    // Make sure we have a valid customer
    const mockUseQuery = jest.spyOn(queries, "useCustomerInfo");
    mockUseQuery.mockReturnValue({
      data: fakeCustomer,
      isFetching: false,
    } as any);

    // make sure you mock the load for extra layouts and themes
    jest.spyOn(cy, "loadSponsorOnlyLayouts").mockResolvedValue();

    // mock valid customer
    jest.spyOn(hooks, "useIsValidCustomer").mockReturnValue(true);

    const mockMutate = jest.fn().mockResolvedValue(fakeMakeCartResponse);
    jest.spyOn(RQ, "useMutation").mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    } as any);

    render(<New />);
    await nextFrame();

    expect(mockMutate).toHaveBeenCalled();
  });
});
