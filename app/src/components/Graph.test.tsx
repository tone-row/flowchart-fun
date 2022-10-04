/* eslint-disable @typescript-eslint/no-empty-function */
import original from "../lib/themes/original";
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
        setHoverLineNumber={setHoverLineNumber}
        shouldResize={0}
        hiddenGraphOptionsText={""}
        options={{
          graphOptions: {},
          linesOfYaml: 0,
          graphOptionsString: "",
          content: "",
        }}
        theme={original}
        bg={"#fff"}
      />
    );
  });

  it.todo("turns off auto layout on dragging");
  it.todo("turns on auto layout when it first loads");
});
