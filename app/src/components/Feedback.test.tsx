import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";

import { render, screen } from "../test-utils";
import Feedback from "./Feedback";

const server = setupServer(
  rest.post("/api/mail", (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  })
);

beforeAll(() => {
  server.listen();
  jest.spyOn(console, "error");
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Feedback", () => {
  test("renders", async () => {
    render(<Feedback />);
    expect(await screen.findByTestId("feedback")).toBeInTheDocument();
  });

  test("can fill and submit form", async () => {
    render(<Feedback />);
    const textarea = await screen.findByTestId("message");
    expect(textarea).toBeInTheDocument();
    userEvent.type(textarea, "Howdy Partner");

    const email = await screen.findByTestId("email");
    expect(email).toBeInTheDocument();
    userEvent.type(email, "test@test.com");

    userEvent.click(screen.getByText(/Submit/gi));

    expect(
      await screen.findByText(/Thank you for your feedback!/gi)
    ).toBeInTheDocument();
  });

  test("handles email sending error", async () => {
    server.use(
      rest.post("/api/mail", (req, res, ctx) => {
        return res(ctx.json({ success: false }));
      })
    );

    render(<Feedback />);
    const textarea = await screen.findByTestId("message");
    userEvent.type(textarea, "Howdy Partner");
    userEvent.type(screen.getByTestId("email"), "test@test.com");
    userEvent.click(screen.getByText(/Submit/gi));

    expect(await screen.findByText(/An error occurred/)).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
