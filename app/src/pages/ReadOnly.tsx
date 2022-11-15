import Editor, { OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";

import EditorError from "../components/EditorError";
import { EditorWrapper } from "../components/EditorWrapper";
import Loading from "../components/Loading";
import Main from "../components/Main";
import { editorOptions } from "../lib/constants";
import { useEditorHover, useEditorOnMount } from "../lib/editorHooks";
import { useAppMode } from "../lib/queries";
import {
  languageId,
  themeNameDark,
  themeNameLight,
} from "../lib/registerLanguage";
import { useReadOnlyDoc } from "../lib/useReadOnlyDoc";
import styles from "./ReadOnly.module.css";

function ReadOnly() {
  const {
    text,
    hiddenGraphOptionsText,
    options,
    theme,
    bg,
    isFrozen,
    fullText,
  } = useReadOnlyDoc();
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

  const { linesOfYaml } = options;

  useEditorHover(editorRef, hoverLineNumber && hoverLineNumber + linesOfYaml);

  return (
    <Main
      setHoverLineNumber={setHoverLineNumber}
      hiddenGraphOptionsText={hiddenGraphOptionsText}
      options={options}
      theme={theme}
      bg={bg}
      isFrozen={isFrozen}
      fullText={fullText}
    >
      <EditorWrapper fullText={fullText}>
        <Editor
          value={text}
          // @ts-ignore
          wrapperClassName={styles.Editor}
          defaultLanguage={languageId}
          options={{
            ...editorOptions,
            readOnly: true,
          }}
          defaultValue={text}
          theme={mode === "dark" ? themeNameDark : themeNameLight}
          loading={loading.current}
          onMount={onMount}
        />
      </EditorWrapper>
      <EditorError />
    </Main>
  );
}

export default ReadOnly;
