import { render } from "../test-utils";
import Graph from "./Graph";

const setHoverLineNumber = jest.fn();

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
