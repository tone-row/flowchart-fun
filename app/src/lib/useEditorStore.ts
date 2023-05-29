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
}>((_set) => ({
  editor: null,
  monaco: null,
}));
