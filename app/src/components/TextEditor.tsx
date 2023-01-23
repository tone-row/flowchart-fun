import Editor, { EditorProps, loader, Monaco } from "@monaco-editor/react";
import { highlight } from "graph-selector";
import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";

import { editorOptions } from "../lib/constants";
import { useEditorHover } from "../lib/editorHooks";
import { useParser } from "../lib/parsers";
import { useAppMode } from "../lib/queries";
import {
  languageId,
  registerLanguages,
  themeNameDark,
  themeNameLight,
} from "../lib/registerLanguage";
import { useHoverLine } from "../lib/useHoverLine";
import Loading from "./Loading";
import styles from "./TextEditor.module.css";

loader.config({
  monaco,
});

type TextEditorProps = EditorProps & {
  editorRef: React.MutableRefObject<null | monaco.editor.IStandaloneCodeEditor>;
  extendOptions?: monaco.editor.IEditorOptions;
};

/** A Monaco editor which stays in sync with the current parser */
export function TextEditor({
  editorRef,
  extendOptions = {},
  ...props
}: TextEditorProps) {
  const parser = useParser();
  const languageId = useLanguageId();
  const [editorIsReady, setEditorIsReady] = useState(false);

  const monacoRef = useRef<Monaco>();

  const { data: mode } = useAppMode();

  useEffect(() => {
    if (!monacoRef.current) return;
    monacoRef.current.editor.setTheme(
      mode === "light" ? themeNameLight : themeNameDark
    );
  }, [mode]);

  // Hover
  const hoverLineNumber = useHoverLine((s) => s.line);
  useEditorHover(editorRef, hoverLineNumber);

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
    monacoRef.current?.editor.setTheme(theme);
  }, [editorIsReady, mode, parser]);

  // Change the editor language when languageId changes
  useEffect(() => {
    if (!editorIsReady || !monacoRef.current) return;
    const editor = monacoRef.current.editor;
    if (!editor) return;
    const model = editor.getModels()[0];
    if (!model) return;
    monacoRef.current.editor.setModelLanguage(model, languageId);
  }, [editorIsReady, languageId]);

  return (
    <Editor
      {...props}
      defaultLanguage={languageId}
      options={{ ...editorOptions, ...extendOptions, theme }}
      loading={<Loading />}
      onMount={(editor, monaco) => {
        registerLanguages(monaco);
        editorRef.current = editor;
        monacoRef.current = monaco;
        // @ts-ignore
        window.monacoRef = monacoRef.current;
        setEditorIsReady(true);
      }}
      wrapperProps={{
        "data-testid": "Editor",
        className: styles.TextEditor,
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
