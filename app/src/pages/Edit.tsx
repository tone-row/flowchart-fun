import Editor, { OnMount } from "@monaco-editor/react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { ClearTextButton } from "../components/ClearTextButton";
import EditorError from "../components/EditorError";
import { EditorWrapper } from "../components/EditorWrapper";
import Layout from "../components/Layout";
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
import { useLocalDoc } from "../lib/useLocalDoc";
import styles from "./Edit.module.css";

const Edit = memo(function Edit() {
  const {
    text,
    options,
    updateDoc,
    hiddenGraphOptionsText,
    theme,
    bg,
    isFrozen,
    fullText,
  } = useLocalDoc();
  const { linesOfYaml } = options;

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

  // Hover
  useEditorHover(editorRef, hoverLineNumber && hoverLineNumber + linesOfYaml);

  const onChange = useCallback(
    (value) => updateDoc({ text: value ?? "" }),
    [updateDoc]
  );

  return (
    <Layout>
      <Main
        setHoverLineNumber={setHoverLineNumber}
        hiddenGraphOptionsText={hiddenGraphOptionsText}
        options={options}
        update={updateDoc}
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
            options={editorOptions}
            onChange={onChange}
            loading={loading.current}
            onMount={onMount}
          />
        </EditorWrapper>
        <ClearTextButton
          handleClear={() => {
            updateDoc({ text: "", hidden: {} });
            if (editorRef.current) {
              editorRef.current.focus();
            }
          }}
        />
        <EditorError />
      </Main>
    </Layout>
  );
});

export default Edit;
