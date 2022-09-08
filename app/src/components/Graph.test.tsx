import { render } from "../test-utils";
import Graph from "./Graph";

const setHoverLineNumber = jest.fn();

beforeEach(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("<Graph/>", () => {
  it("renders without crashing", () => {
    render(
      <Graph
        textToParse={""}
        setHoverLineNumber={setHoverLineNumber}
        shouldResize={0}
      />
    );
  });

  it.todo("turns off auto layout on dragging");
  it.todo("turns on auto layout when it first loads");
});
