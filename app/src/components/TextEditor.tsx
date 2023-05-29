import Editor, { EditorProps } from "@monaco-editor/react";
import { highlight } from "graph-selector";
import { editor } from "monaco-editor";
import { useContext, useEffect, useRef, useState } from "react";

import { editorOptions } from "../lib/constants";
import { useParser } from "../lib/parsers";
import {
  languageId,
  registerLanguages,
  themeNameDark,
  themeNameLight,
} from "../lib/registerLanguage";
import { useEditorStore } from "../lib/useEditorStore";
import { AppContext } from "./AppContext";
import Loading from "./Loading";

type TextEditorProps = EditorProps & {
  extendOptions?: editor.IEditorOptions;
};

/** A Monaco editor which stays in sync with the current parser */
export function TextEditor({ extendOptions = {}, ...props }: TextEditorProps) {
  const parser = useParser();
  const languageId = useLanguageId();
  const [editorIsReady, setEditorIsReady] = useState(false);

  const { mode } = useContext(AppContext);

  const isDragging = useEditorStore((s) => s.isDragging);

  useEffect(() => {
    const monaco = useEditorStore.getState().monaco;
    if (!monaco) return;
    monaco.editor.setTheme(mode === "light" ? themeNameLight : themeNameDark);
  }, [mode]);

  // Setup Hover Effect
  const hoverLineNumber = useEditorStore((s) => s.hoverLineNumber);
  useEditorHover(hoverLineNumber);

  // Set the theme when the editor is ready
  const [theme, setTheme] = useState(themeNameLight);
  useEffect(() => {
    if (!editorIsReady) return;
    let theme = highlight.defaultTheme;
    if (parser === "v1") {
      if (mode === "light") {
        theme = themeNameLight;
      } else {
        theme = themeNameDark;
      }
    } else if (parser === "graph-selector") {
      if (mode === "light") {
        theme = highlight.defaultTheme;
      } else {
        theme = highlight.defaultThemeDark;
      }
    }

    setTheme(theme);
    const monaco = useEditorStore.getState().monaco;
    if (!monaco) return;
    monaco.editor.setTheme(theme);
  }, [editorIsReady, mode, parser]);

  // Change the editor language when languageId changes
  useEffect(() => {
    const monaco = useEditorStore.getState().monaco;
    if (!editorIsReady || !monaco) return;
    const editor = monaco.editor;
    if (!editor) return;
    const model = editor.getModels()[0];
    if (!model) return;
    monaco.editor.setModelLanguage(model, languageId);
  }, [editorIsReady, languageId]);

  return (
    <Editor
      {...props}
      defaultLanguage={languageId}
      options={{ ...editorOptions, ...extendOptions, theme }}
      loading={<Loading />}
      onMount={(editor, monaco) => {
        registerLanguages(monaco);

        // Store the refs in client side zustand state
        useEditorStore.setState({ editor, monaco });

        setEditorIsReady(true);
      }}
      wrapperProps={{
        "data-testid": "Editor",
        className: isDragging ? "overflow-hidden" : "",
      }}
    />
  );
}

function useLanguageId() {
  const parser = useParser();
  switch (parser) {
    case "v1":
      return languageId;
    case "graph-selector":
      return highlight.languageId;
  }
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
