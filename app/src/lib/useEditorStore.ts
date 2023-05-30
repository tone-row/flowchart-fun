import type { editor } from "monaco-editor";
import { create } from "zustand";

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
}>((_set) => ({
  editor: null,
  monaco: null,
  isDragging: false,
  markers: [],
}));

export function updateModelMarkers() {
  const { monaco, editor, markers } = useEditorStore.getState();
  if (!monaco || !editor) return;
  const model = editor.getModel();
  if (!model) return;
  monaco.editor.setModelMarkers(model, "editor", markers);
}
