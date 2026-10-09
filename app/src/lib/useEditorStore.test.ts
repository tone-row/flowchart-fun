import type { editor } from "monaco-editor";

import {
  moveCursorToLine,
  revealAndHighlightLine,
  useEditorStore,
} from "./useEditorStore";

function mountFakeEditor() {
  const fake = {
    focus: jest.fn(),
    setPosition: jest.fn(),
    revealLineInCenterIfOutsideViewport: jest.fn(),
  };
  useEditorStore.setState({
    editor: fake as unknown as editor.IStandaloneCodeEditor,
  });
  return fake;
}

afterEach(() => {
  useEditorStore.setState({ editor: null, selectedLineNumber: undefined });
});

test("moveCursorToLine focuses the editor, puts the cursor on the line, and scrolls it into view", () => {
  const fake = mountFakeEditor();

  moveCursorToLine(40);

  expect(fake.focus).toHaveBeenCalled();
  expect(fake.setPosition).toHaveBeenCalledWith({
    lineNumber: 40,
    column: Infinity,
  });
  expect(fake.revealLineInCenterIfOutsideViewport).toHaveBeenCalledWith(40);
});

test("revealAndHighlightLine scrolls to and highlights the line without taking focus or moving the cursor", () => {
  const fake = mountFakeEditor();

  revealAndHighlightLine(12);

  expect(fake.revealLineInCenterIfOutsideViewport).toHaveBeenCalledWith(12);
  expect(useEditorStore.getState().selectedLineNumber).toBe(12);
  expect(fake.focus).not.toHaveBeenCalled();
  expect(fake.setPosition).not.toHaveBeenCalled();
});
