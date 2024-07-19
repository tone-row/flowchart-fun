import type { editor } from "monaco-editor";
import { create } from "zustand";
import { useMobileStore } from "./useMobileStore";

/**
 * Stores client-side state related to the editor.
 */
export const useEditorStore = create<{
  /** A reference to the monaco editor */
  editor: null | editor.IStandaloneCodeEditor;
  /** A reference to the universal monaco */
  monaco: null | typeof import("monaco-editor");
  /** The line potential line being hovered */
  hoverLineNumber?: number;
  /** Whether or not the size of the editor is currently being dragged */
  isDragging: boolean;
  /** The markers currently on the model */
  markers: editor.IMarkerData[];
  /** The current text selection */
  selection: string;
  /** Stores the text the user recently pasted into the editor */
  userPasted: string;
}>((_set) => ({
  editor: null,
  monaco: null,
  isDragging: false,
  markers: [],
  selection: "",
  userPasted: "",
}));

export function updateModelMarkers() {
  const { monaco, editor, markers } = useEditorStore.getState();
  if (!monaco || !editor) return;
  const model = editor.getModel();
  if (!model) return;
  monaco.editor.setModelMarkers(model, "editor", markers);
}

/**
 * Focuses the editor. Then moves the cursor to the given line.
 */
export function moveCursorToLine(line: number) {
  // We toggle the tab just in case we're in mobile view
  const { tab, toggleTab } = useMobileStore.getState();
  if (tab === "graph") {
    toggleTab();
    requestAnimationFrame(focus);
  } else {
    focus();
  }

  function focus() {
    const { editor } = useEditorStore.getState();
    if (!editor) return;
    editor.focus();
    editor.setPosition({ lineNumber: line, column: Infinity });
  }
}
