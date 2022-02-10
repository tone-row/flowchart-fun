import { act } from "react-dom/test-utils";
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
});
