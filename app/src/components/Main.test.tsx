import original from "../lib/themes/original";
import { render } from "../test-utils";
import Main from "./Main";

beforeAll(() => {
  jest.spyOn(console, "warn");
  jest.spyOn(console, "error");
});

describe("Main", () => {
  test("renders", () => {
    render(
      <Main
        hiddenGraphOptionsText={""}
        setHoverLineNumber={() => null}
        fullText={""}
        options={{
          graphOptions: {},
          graphOptionsString: "",
          linesOfYaml: 0,
          content: "",
        }}
        theme={original}
        bg={"#fff"}
        isFrozen={false}
      />
    );
  });
});
