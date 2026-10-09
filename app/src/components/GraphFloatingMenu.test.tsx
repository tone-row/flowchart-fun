import { fireEvent, render } from "../test-utils";
import { useDoc } from "../lib/useDoc";
import { useGraphStore } from "../lib/useGraphStore";
import { GraphFloatingMenu } from "./GraphFloatingMenu";

const UNALIGNED = { a: { x: 0, y: 0 }, b: { x: 100, y: 50 } };

function positions() {
  return useDoc.getState().meta.nodePositions;
}

function makeTarget(html: string) {
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.querySelector("[data-target]") as HTMLElement;
}

beforeEach(() => {
  document.body.innerHTML = "";
  useDoc.setState({ meta: { nodePositions: { ...UNALIGNED } } });
  useGraphStore.setState({ selectedNodes: ["a", "b"] });
  render(<GraphFloatingMenu />);
});

describe("align hotkeys", () => {
  test.each([
    ["h", { a: { x: 50, y: 0 }, b: { x: 50, y: 50 } }],
    ["v", { a: { x: 0, y: 25 }, b: { x: 100, y: 25 } }],
  ])(
    "%s aligns the selected nodes when focus is not in a text field",
    (key, aligned) => {
      fireEvent.keyDown(document.body, { key });
      expect(positions()).toEqual(aligned);
    }
  );

  test.each([
    [
      "the Monaco editor",
      `<div class="monaco-editor"><div><textarea data-target></textarea></div></div>`,
    ],
    [
      "an element inside the Monaco editor",
      `<div class="monaco-editor"><div data-target tabindex="0"></div></div>`,
    ],
    ["an input", `<input data-target />`],
    ["a textarea", `<textarea data-target></textarea>`],
    ["a select", `<select data-target><option>v</option></select>`],
    [
      "a contenteditable element",
      `<div contenteditable="true"><p data-target>text</p></div>`,
    ],
  ])("h and v do nothing while typing in %s", (_, html) => {
    const target = makeTarget(html);
    fireEvent.keyDown(target, { key: "h" });
    fireEvent.keyDown(target, { key: "v" });
    expect(positions()).toEqual(UNALIGNED);
  });
});
