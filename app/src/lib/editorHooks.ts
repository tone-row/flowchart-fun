import { MutableRefObject, useEffect, useRef } from "react";

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
