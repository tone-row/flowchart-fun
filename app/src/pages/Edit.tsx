import Editor, { OnMount } from "@monaco-editor/react";
import { useThrottleCallback } from "@react-hook/throttle";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { ClearTextButton } from "../components/ClearTextButton";
import EditorError from "../components/EditorError";
import GraphProvider from "../components/GraphProvider";
import Loading from "../components/Loading";
import useGraphOptions from "../components/useGraphOptions";
import { editorOptions } from "../lib/constants";
import { useEditorHover, useEditorOnMount } from "../lib/editorHooks";
import { useLocalStorageText } from "../lib/hooks";
import { useAppMode } from "../lib/queries";
import {
  languageId,
  themeNameDark,
  themeNameLight,
} from "../lib/registerLanguage";
import { useUpdateGraphOptionsText } from "../lib/useUpdateGraphOptionsText";
import styles from "./Edit.module.css";

const Edit = memo(function Edit() {
  const { text, setText, hiddenGraphOptions, setHiddenGraphOptions } =
    useLocalStorageText();
  const [toParse, setToParse] = useState(text);
  const throttleSetToParse = useThrottleCallback(setToParse, 2, true);
  const { graphOptions, content, linesOfYaml } = useGraphOptions(toParse);

  const loading = useRef(<Loading />);

  const { data: mode } = useAppMode();
  const editorRef = useRef<Parameters<OnMount>[0]>(null);
  const monacoRef = useRef<any>();
  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  useEffect(() => {
    throttleSetToParse(text);
  }, [text, throttleSetToParse]);

  const onMount = useEditorOnMount(editorRef, monacoRef);
  useEffect(() => {
    if (!monacoRef.current) return;
    monacoRef.current.editor.setTheme(
      mode === "light" ? themeNameLight : themeNameDark
    );
  }, [mode]);

  const updateGraphOptionsText = useUpdateGraphOptionsText(
    content,
    graphOptions,
    setText,
    setToParse,
    toParse
  );

  // Hover
  useEditorHover(editorRef, hoverLineNumber && hoverLineNumber + linesOfYaml);

  const onChange = useCallback((value) => setText(value ?? ""), [setText]);

  return (
    <GraphProvider
      editable={true}
      textToParse={toParse}
      setHoverLineNumber={setHoverLineNumber}
      graphOptions={graphOptions}
      updateGraphOptionsText={updateGraphOptionsText}
      linesOfYaml={linesOfYaml}
      setHiddenGraphOptions={setHiddenGraphOptions}
      hiddenGraphOptions={hiddenGraphOptions}
    >
      <Editor
        value={text}
        wrapperClassName={styles.Editor}
        defaultLanguage={languageId}
        options={editorOptions}
        onChange={onChange}
        loading={loading.current}
        onMount={onMount}
      />
      <ClearTextButton
        handleClear={() => {
          setText("");
          setToParse("");
          if (editorRef.current) {
            editorRef.current.focus();
          }
        }}
      />
      <EditorError />
    </GraphProvider>
  );
});

export default Edit;
