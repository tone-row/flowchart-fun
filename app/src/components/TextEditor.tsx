import Editor, { EditorProps } from "@monaco-editor/react";
import { highlight } from "graph-selector";
import { editor } from "monaco-editor";
import { useEffect, useRef } from "react";

import { editorOptions } from "../lib/constants";
import { useLightOrDarkMode } from "../lib/hooks";
import { updateModelMarkers, useEditorStore } from "../lib/useEditorStore";
import Loading from "./Loading";

type TextEditorProps = EditorProps & {
  extendOptions?: editor.IEditorOptions;
};

/** A Monaco editor which stays in sync with the current parser */
export function TextEditor({ extendOptions = {}, ...props }: TextEditorProps) {
  const mode = useLightOrDarkMode();
  const theme =
    mode === "light" ? highlight.defaultTheme : highlight.defaultThemeDark;

  const isDragging = useEditorStore((s) => s.isDragging);

  // Update editor theme depending on light mode or dark mode
  useEffect(() => {
    const monaco = useEditorStore.getState().monaco;
    if (!monaco) return;
    monaco.editor.setTheme(theme);
  }, [theme]);

  // Setup Hover Effect
  const hoverLineNumber = useEditorStore((s) => s.hoverLineNumber);
  useEditorHover(hoverLineNumber);

  return (
    <Editor
      {...props}
      defaultLanguage={highlight.languageId}
      options={{ ...editorOptions, ...extendOptions, theme }}
      loading={<Loading />}
      beforeMount={highlight.registerHighlighter}
      onMount={(editor, monaco) => {
        // Store the refs in client side zustand state
        useEditorStore.setState({ editor, monaco });

        // Draw any current model markers
        updateModelMarkers();

        // double set the theme
        monaco.editor.setTheme(theme);
      }}
      wrapperProps={{
        "data-testid": "Editor",
        className: isDragging ? "overflow-hidden" : "",
      }}
    />
  );
}

/** Keep track of decoratins on the current editor and show an indication of
 * hovering when the hover line number changes */
export function useEditorHover(hoverLineNumber?: number) {
  const decorations = useRef<string[]>([]);
  useEffect(() => {
    const editor = useEditorStore.getState().editor;
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
  }, [hoverLineNumber]);
}
