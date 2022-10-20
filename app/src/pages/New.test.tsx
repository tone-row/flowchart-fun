import * as RQ from "react-query";

import * as cy from "../lib/cytoscape";
import * as helpers from "../lib/helpers";
import * as hooks from "../lib/hooks";
import * as queries from "../lib/queries";
import { supabase } from "../lib/supabaseClient";
import {
  fakeCustomer,
  fakeMakeCartResponse,
  history,
  mockGetSessionReturn,
  nextFrame,
  render,
  screen,
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

describe.skip("New Page", () => {
  it("should render", async () => {
    render(<New />);
    await nextFrame();
  });

  it("should foward to new local chart if not logged in", async () => {
    const mock = jest.spyOn(helpers, "randomChartName");
    mock.mockReturnValue(fakeName);
    render(<New />);
    await nextFrame();
    expect(mock).toHaveBeenCalled();
    expect(history.location.pathname).toEqual(`/${fakeName}`);
  });

  it("should use default text if no template passed for unauth user", async () => {
    const tempFakeName = "temp-fake-name";
    // control the generated chart name
    jest.spyOn(helpers, "randomChartName").mockReturnValueOnce(tempFakeName);
    const push = jest.spyOn(history, "push");
    render(<New />);
    expect(await screen.findByText("Creating Flowchart")).toBeInTheDocument();

    await nextFrame();
    expect(push).toHaveBeenCalledWith(`/${tempFakeName}`);

    // Confirm it's in local storage
    const key = helpers.titleToLocalStorageKey(tempFakeName);
    expect(global.localStorage.getItem(key)).toEqual(
      `This app works by typing\n  Indenting creates a link to the current line\n  any text: before a colon creates a label\n  Create a link directly using the exact label text\n    like this: (This app works by typing)\n    [custom ID] or\n      by adding an %5BID%5D and referencing that\n        like this: (custom ID) // You can also use single-line comments\n/*\nor\nmultiline\ncomments\n\nHave fun! 🎉\n*/`
    );
  });

  it("should create a hosted chart if logged in", async () => {
    // Make sure we have a supabase session
    if (!supabase) throw new Error("supabase is undefined");
    const mockGetSession = jest.spyOn(supabase.auth, "getSession");
    mockGetSession.mockResolvedValue(mockGetSessionReturn);

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

  it("should use template for auth user", async () => {
    // Make sure we have a supabase session
    if (!supabase) throw new Error("supabase is undefined");
    const mockGetSession = jest.spyOn(supabase.auth, "getSession");
    mockGetSession.mockResolvedValue(mockGetSessionReturn);

    // Make sure we have a valid customer
    const mockUseQuery = jest.spyOn(queries, "useCustomerInfo");
    mockUseQuery.mockReturnValue({
      data: fakeCustomer,
      isFetching: false,
    } as any);

    // make sure we return a template
    const fakeChart = `This app works by typing\n  Indenting creates a link to the current line\n  any text: before a colon creates a label\n  Create a link directly using the exact label text\n    like this: (This app works by typing)\n    [custom ID] or\n      by adding an %5BID%5D and referencing that\n        like this: (custom ID) // You can also use single-line comments\n/*\nor\nmultiline\ncomments\n\nHave fun! 🎉\n*/`;

    // control the generated chart name
    const mock = jest.spyOn(helpers, "randomChartName");
    mock.mockReturnValue(fakeName);

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

    expect(mockMutate).toHaveBeenCalledWith({
      chart: fakeChart,
      name: fakeName,
      user_id: fakeCustomer.customerId,
    });
  });
});
