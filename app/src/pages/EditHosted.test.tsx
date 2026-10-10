import { Provider as TooltipProvider } from "@radix-ui/react-tooltip";
import { render } from "@testing-library/react";
import { Suspense } from "react";
import { QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { AppContext } from "../components/AppContextProvider";
import { I18n } from "../components/I18n";
import { getHostedChart, queryClient, updateChartText } from "../lib/queries";
import { useDoc } from "../lib/useDoc";
import { act, fakeCustomer, fakeSession, screen, sleep } from "../test-utils";
import EditHosted from "./EditHosted";

jest.mock("../lib/queries", () => ({
  ...jest.requireActual("../lib/queries"),
  getHostedChart: jest.fn(),
  updateChartText: jest.fn(),
}));

const mockedGetHostedChart = getHostedChart as jest.MockedFunction<
  typeof getHostedChart
>;
const mockedUpdateChartText = updateChartText as jest.MockedFunction<
  typeof updateChartText
>;

const CHART_ID = "123";
const SERVER_DOC = "a\n  b\n=====\n{}\n=====";

function renderHosted() {
  const value = {
    session: fakeSession,
    checkedSession: true,
    customerIsLoading: false,
    customer: fakeCustomer,
    language: "en",
  };
  return render(
    <MemoryRouter initialEntries={[`/u/${CHART_ID}`]}>
      <QueryClientProvider client={queryClient}>
        <AppContext.Provider value={value as any}>
          <I18n>
            <TooltipProvider>
              <Suspense fallback={<div>loading</div>}>
                <Routes>
                  <Route path="/u/:id" element={<EditHosted />} />
                </Routes>
              </Suspense>
            </TooltipProvider>
          </I18n>
        </AppContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
  queryClient.clear();
  mockedGetHostedChart.mockReset();
  mockedUpdateChartText.mockReset();
  mockedGetHostedChart.mockImplementation(async () => ({
    id: Number(CHART_ID),
    name: "test chart",
    chart: SERVER_DOC,
    updated_at: "2022-09-01T18:17:55.828104+00:00",
    created_at: "2022-09-01T18:17:55.828104+00:00",
    public_id: null,
    is_public: false,
  }));
  mockedUpdateChartText.mockResolvedValue(undefined);
});

function loadChartAgainAfterMount() {
  return act(async () => {
    await queryClient.refetchQueries(["useHostedDoc", CHART_ID]);
  });
}

describe("<EditHosted/> autosave", () => {
  test("opening a chart does not write; a real edit writes once", async () => {
    renderHosted();
    await screen.findByText("loading");
    await sleep(100);
    expect(screen.queryByText("loading")).toBeNull();
    expect(useDoc.getState().text).toBe("a\n  b\n");

    await loadChartAgainAfterMount();
    await sleep(1500);
    expect(mockedUpdateChartText).not.toHaveBeenCalled();

    act(() => {
      useDoc.setState({ text: "a\n  b\n  c" }, false, "EditHosted/text");
    });
    await sleep(1500);
    expect(mockedUpdateChartText).toHaveBeenCalledTimes(1);
    expect(mockedUpdateChartText.mock.calls[0][0]).toContain("a\n  b\n  c");
    expect(mockedUpdateChartText.mock.calls[0][1]).toBe(CHART_ID);
  });

  test("a failed save is kept, flagged and sent again on reconnect", async () => {
    renderHosted();
    await screen.findByText("loading");
    await sleep(100);
    mockedUpdateChartText.mockRejectedValueOnce(new Error("Failed to fetch"));

    act(() => {
      useDoc.setState({ text: "a\n  b\n  c" }, false, "EditHosted/text");
    });
    await sleep(1500);
    expect(mockedUpdateChartText).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("img", { name: "Changes not saved" })
    ).toBeInTheDocument();

    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await sleep(1500);
    });
    expect(useDoc.getState().text).toBe("a\n  b\n  c");
    expect(mockedUpdateChartText).toHaveBeenCalledTimes(2);
    expect(mockedUpdateChartText.mock.calls[1][0]).toBe(
      mockedUpdateChartText.mock.calls[0][0]
    );
    expect(screen.queryByRole("img", { name: "Changes not saved" })).toBeNull();
  });
});
