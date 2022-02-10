import { screen } from "@testing-library/react";
import { history, render } from "../test-utils";
import Router from "./Router";

describe("Router", () => {
  test("home page is Edit screen", async () => {
    history.push("/");
    render(<Router />);
    expect(await screen.findByText(/flowchart\.fun/)).toBeInTheDocument();
  });
});
