import Editor, { OnMount } from "@monaco-editor/react";
import { useThrottleCallback } from "@react-hook/throttle";
import merge from "deepmerge";
import { stringify } from "gray-matter";
import { Check, Timer } from "phosphor-react";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useMutation } from "react-query";
import { useParams } from "react-router";
import { useDebouncedCallback } from "use-debounce";

import EditorError from "../components/EditorError";
import GraphProvider from "../components/GraphProvider";
import Loading from "../components/Loading";
import Spinner from "../components/Spinner";
import useGraphOptions from "../components/useGraphOptions";
import {
  delimiters,
  editorOptions,
  GraphOptionsObject,
} from "../lib/constants";
import { useEditorHover, useEditorOnMount } from "../lib/editorHooks";
import { useIsValidSponsor } from "../lib/hooks";
import {
  queryClient,
  updateChartText,
  useAppMode,
  useChart,
} from "../lib/queries";
import {
  languageId,
  themeNameDark,
  themeNameLight,
} from "../lib/registerLanguage";
import editStyles from "./Edit.module.css";
import styles from "./EditUserChart.module.css";

export default function EditUserChart() {
  const validSponsor = useIsValidSponsor();
  const { id } = useParams<{ id?: string }>();
  const { data } = useChart(id);
  const [text, setText] = useState(data?.chart ?? "");
  const [textToParse, setTextToParse] = useReducer(
    (t: string, u: string) => u,
    text
  );
  const lastText = useRef(text);
  const setTextToParseThrottle = useThrottleCallback(setTextToParse, 2, true);
  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  const editorRef = useRef<null | Parameters<OnMount>[0]>(null);
  const monacoRef = useRef<any>();
  const { data: mode } = useAppMode();
  const loading = useRef(<Loading />);
  const { graphOptions, content } = useGraphOptions(textToParse);

  const { mutate, isLoading } = useMutation((currentText: string) =>
    updateChartText(currentText, id)
  );
  const {
    callback: debounced,
    flush,
    pending,
  } = useDebouncedCallback((currentText: string) => {
    mutate(currentText);
  }, 1000);

  useEffect(() => {
    if (lastText.current !== text) {
      debounced(text);
      lastText.current = text;
    }
  }, [text, debounced]);

  // This is to make sure we update if people exit the tab quickly
  useEffect(() => {
    return () => {
      flush();
      queryClient.resetQueries(["useChart", id]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTextToParseThrottle(text);
  }, [text, setTextToParseThrottle]);

  const onMount = useEditorOnMount(editorRef, monacoRef);
  useEffect(() => {
    if (!monacoRef.current) return;
    monacoRef.current.editor.setTheme(
      mode === "light" ? themeNameLight : themeNameDark
    );
  }, [mode]);

  useEffect(() => {
    if (!monacoRef.current) return;
    monacoRef.current.editor.setTheme(
      mode === "light" ? themeNameLight : themeNameDark
    );
  }, [mode]);

  const updateGraphOptionsText = useCallback(
    (o: GraphOptionsObject) => {
      let text = "";
      if (Object.keys(graphOptions).length) {
        text = stringify(content, merge(graphOptions, o), {
          delimiters,
        });
      } else {
        // No frontmatter
        text = stringify(textToParse, o, { delimiters });
      }
      setText(text);
      setTextToParse(text);
    },
    [content, graphOptions, setText, textToParse]
  );

  // Hover
  useEditorHover(editorRef, hoverLineNumber);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChange = useCallback((value) => setText(value ?? ""), []);

  return (
    <GraphProvider
      editable={true}
      textToParse={textToParse}
      setHoverLineNumber={setHoverLineNumber}
      graphOptions={graphOptions}
      updateGraphOptionsText={updateGraphOptionsText}
    >
      <Editor
        value={text}
        wrapperClassName={editStyles.Editor}
        defaultLanguage={languageId}
        options={{
          ...editorOptions,
          readOnly: !validSponsor,
        }}
        onChange={onChange}
        loading={loading.current}
        onMount={onMount}
      />
      <LoadingState isLoading={isLoading} pending={pending()} />
      <EditorError />
    </GraphProvider>
  );
}

function LoadingState({
  pending,
  isLoading,
}: {
  pending: boolean;
  isLoading: boolean;
}) {
  return (
    <div className={styles.LoadingState}>
      {pending ? (
        <Timer size={28} color="var(--color-edgeHover)" />
      ) : isLoading ? (
        <Spinner r={10} s={2} c="var(--palette-purple-0)" />
      ) : (
        <Check size={30} color="var(--palette-green-0)" />
      )}
    </div>
  );
}
