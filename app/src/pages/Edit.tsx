import Editor, { OnMount } from "@monaco-editor/react";
import { useThrottleCallback } from "@react-hook/throttle";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

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

export default function Edit() {
  const [text, setText] = useLocalStorageText();
  const [textToParse, setTextToParse] = useReducer(
    (t: string, u: string) => u,
    text
  );
  const setTextToParseThrottle = useThrottleCallback(setTextToParse, 2, true);
  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  const editorRef = useRef<Parameters<OnMount>[0]>(null);
  const monacoRef = useRef<any>();
  const { data: mode } = useAppMode();
  const loading = useRef(<Loading />);
  const { graphOptions, content, linesOfYaml } = useGraphOptions(textToParse);
  useEffect(() => {
    setTextToParseThrottle(text);
  }, [text, setTextToParseThrottle]);

  console.log({ graphOptions });

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
    setTextToParse,
    textToParse
  );

  // Hover
  useEditorHover(editorRef, hoverLineNumber && hoverLineNumber + linesOfYaml);

  const onChange = useCallback((value) => setText(value ?? ""), [setText]);

  return (
    <GraphProvider
      editable={true}
      textToParse={textToParse}
      setHoverLineNumber={setHoverLineNumber}
      graphOptions={graphOptions}
      updateGraphOptionsText={updateGraphOptionsText}
      linesOfYaml={linesOfYaml}
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
      <EditorError />
    </GraphProvider>
  );
}
