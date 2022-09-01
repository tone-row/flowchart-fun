import { screen } from "@testing-library/react";

import { render } from "../test-utils";
import Router from "./Router";

beforeAll(() => {
  jest.spyOn(console, "error");
});

describe("Router", () => {
  test("home page is Edit screen", async () => {
    window.history.pushState({}, "", "/");
    render(<Router />);
    expect(screen.getByText(/flowchart\.fun/)).toBeInTheDocument();
  });
});
