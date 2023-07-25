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
  jest.spyOn(console, "error").mockImplementation(() => null);
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Feedback", () => {
  test("renders", async () => {
    render(<Feedback />);
    expect(await screen.findByTestId("feedback")).toBeInTheDocument();
  });

  test("can fill and submit form", async () => {
    const user = userEvent.setup();
    render(<Feedback />);

    const emailInput = screen.getByTestId("email");
    expect(emailInput).toBeInTheDocument();
    await user.type(emailInput, "test@test.com");

    const textarea = screen.getByTestId("message");
    expect(textarea).toBeInTheDocument();
    await user.type(textarea, "This is some feedback");

    const submitButton = screen.getByText(/Submit/i);
    user.click(submitButton);

    expect(
      await screen.findByText(/Thank you for your feedback/i)
    ).toBeInTheDocument();
  });

  test("handles email sending error", async () => {
    const user = userEvent.setup();
    server.use(
      rest.post("/api/mail", (req, res, ctx) => {
        return res(ctx.json({ success: false }));
      })
    );

    render(<Feedback />);
    const textarea = await screen.findByTestId("message");
    await user.type(textarea, "Howdy Partner");
    await user.type(screen.getByTestId("email"), "test@test.com");
    userEvent.click(screen.getByText(/Submit/i));

    expect(await screen.findByText(/An error occurred/)).toBeInTheDocument();
  });
});
