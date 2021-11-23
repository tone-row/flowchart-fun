import { useMonaco } from "@monaco-editor/react";
import { MutableRefObject, useCallback, useEffect, useRef } from "react";

import { defineThemes, useMonacoLanguage } from "./registerLanguage";

export function useEditorOnMount(
  theme: "light" | "dark",
  editorRef: MutableRefObject<any>
) {
  const monaco = useMonaco();
  // Add language
  useMonacoLanguage(monaco);

  return useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      defineThemes(monaco, theme);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );
}

export function useEditorHover(
  editorRef: MutableRefObject<any>,
  hoverLineNumber?: number
) {
  const decorations = useRef<any[]>([]);
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoverLineNumber]);
}
