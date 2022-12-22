import { OnMount, useMonaco } from "@monaco-editor/react";
import {
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

import { AppContext } from "../components/AppContext";
import {
  defineThemes,
  themeNameDark,
  themeNameLight,
  useMonacoLanguage,
} from "./registerLanguage";

export function useEditorOnMount(
  editorRef: MutableRefObject<any>,
  monacoRef: MutableRefObject<any>
) {
  const { mode } = useContext(AppContext);
  const monaco = useMonaco();
  // Add language
  useMonacoLanguage(monaco);

  return useCallback<OnMount>(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      defineThemes(monaco);
      monacoRef.current?.editor.setTheme(
        mode === "light" ? themeNameLight : themeNameDark
      );
    },
    [editorRef, mode, monacoRef]
  );
}

export function useEditorHover(
  editorRef: MutableRefObject<any>,
  hoverLineNumber?: number
) {
  const decorations = useRef<any[]>([]);
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (typeof hoverLineNumber === "number") {
      decorations.current = editor.deltaDecorations(
        [],
        [
          {
            range: {
              startLineNumber: hoverLineNumber,
              startColumn: 1,
              endLineNumber: hoverLineNumber,
              endColumn: 1,
            },
            options: {
              isWholeLine: true,
              className: "node-hover",
            },
          },
        ]
      );
    } else {
      decorations.current = editor.deltaDecorations(decorations.current, []);
    }
  }, [editorRef, hoverLineNumber]);
}
