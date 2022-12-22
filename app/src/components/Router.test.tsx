import { screen } from "@testing-library/react";

import { nextFrame, render } from "../test-utils";
import Router from "./Router";

describe("Router", () => {
  test(
    "home page is Edit screen",
    async () => {
      jest.spyOn(console, "error").mockImplementation(() => ({}));
      jest.spyOn(console, "warn").mockImplementation(() => ({}));
      render(<Router />);
      await nextFrame();
      expect(await screen.findByText(/flowchart\.fun/)).toBeInTheDocument();
    },
    10 * 1000
  );
});
