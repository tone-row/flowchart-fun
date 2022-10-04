import { nextFrame, renderHook } from "../test-utils";
import { HIDDEN_GRAPH_OPTIONS_DIVIDER } from "./constants";
import * as hooks from "./hooks";
import { useParseDoc } from "./useParseDoc";

describe("useParseDoc", () => {
  beforeAll(() => {
    jest.spyOn(hooks, "useIsPublicHostedCharted").mockReturnValue(true);
    jest.spyOn(hooks, "useIsValidSponsor").mockReturnValue(true);
  });

  it("should not throw", async () => {
    const result = () => {
      renderHook(() => useParseDoc("", () => null, false));
    };

    expect(result).not.toThrow();
    await nextFrame();
  });

  it("should return the text separated from the hidden graph options", async () => {
    const { result } = renderHook(() =>
      useParseDoc(
        `abc${HIDDEN_GRAPH_OPTIONS_DIVIDER}{"x":5}`,
        () => null,
        false
      )
    );
    await nextFrame();
    expect(result.current.text).toBe("abc");
    expect(result.current.hiddenGraphOptionsText).toBe(`{"x":5}`);
  });
});
