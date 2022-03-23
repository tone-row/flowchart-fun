import Editor, { OnMount } from "@monaco-editor/react";
import strip from "@tone-row/strip-comments";
import matter from "gray-matter";
import { useEffect, useRef, useState } from "react";

import EditorError from "../components/EditorError";
import GraphProvider from "../components/GraphProvider";
import Loading from "../components/Loading";
import { delimiters, editorOptions } from "../lib/constants";
import { useEditorHover, useEditorOnMount } from "../lib/editorHooks";
import { useReadOnlyText } from "../lib/hooks";
import { useAppMode } from "../lib/queries";
import {
  languageId,
  themeNameDark,
  themeNameLight,
} from "../lib/registerLanguage";
import styles from "./ReadOnly.module.css";

function ReadOnly() {
  const textToParse = useReadOnlyText();
  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  const editorRef = useRef<null | Parameters<OnMount>[0]>(null);
  const monacoRef = useRef<any>();
  const { data: mode } = useAppMode();
  const loading = useRef(<Loading />);

  const onMount = useEditorOnMount(editorRef, monacoRef);
  useEffect(() => {
    if (!monacoRef.current) return;
    monacoRef.current.editor.setTheme(
      mode === "light" ? themeNameLight : themeNameDark
    );
  }, [mode]);

  const { data: graphOptions, matter: graphOptionsString } = matter(
    strip(textToParse),
    { delimiters }
  );

  const linesOfYaml = graphOptionsString
    ? graphOptionsString.split("\n").length + 1
    : 0;

  useEditorHover(editorRef, hoverLineNumber && hoverLineNumber + linesOfYaml);

  return (
    <GraphProvider
      editable={false}
      setHoverLineNumber={setHoverLineNumber}
      textToParse={textToParse}
      graphOptions={graphOptions}
      linesOfYaml={linesOfYaml}
    >
      <Editor
        value={textToParse}
        wrapperClassName={styles.Editor}
        defaultLanguage={languageId}
        options={{
          ...editorOptions,
          readOnly: true,
        }}
        defaultValue={textToParse}
        theme={mode === "dark" ? themeNameDark : themeNameLight}
        loading={loading.current}
        onMount={onMount}
      />
      <EditorError />
    </GraphProvider>
  );
}

export default ReadOnly;
