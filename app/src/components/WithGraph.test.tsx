import { render } from "../test-utils";
import WithGraph from "./WithGraph";

beforeAll(() => {
  jest.spyOn(console, "warn");
  jest.spyOn(console, "error");
});

describe("Main", () => {
  test("renders", () => {
    render(<WithGraph />);
  });
});
