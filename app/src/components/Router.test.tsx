import { screen } from "@testing-library/react";
import { render } from "../test-utils";
import Router from "./Router";

describe("Router", () => {
  test("home page is Edit screen", async () => {
    window.history.pushState({}, "", "/");
    render(<Router />);
    expect(await screen.findByText(/flowchart\.fun/)).toBeInTheDocument();
  });
});
