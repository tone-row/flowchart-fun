import { render } from "../test-utils";
import Main from "./Main";

beforeAll(() => {
  jest.spyOn(console, "warn");
  jest.spyOn(console, "error");
});

describe("Main", () => {
  test("renders", () => {
    render(<Main textToParse="" setHoverLineNumber={() => null} />);
  });
});
