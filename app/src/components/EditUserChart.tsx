import Editor, { OnMount, useMonaco } from "@monaco-editor/react";
import { useThrottleCallback } from "@react-hook/throttle";
import {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router";
import { editorOptions, GraphOptionsObject, delimiters } from "../constants";
import merge from "deepmerge";
import { queryClient, updateChartText, useChart } from "../lib/queries";
import {
  useMonacoLanguage,
  languageId,
  defineThemes,
} from "../registerLanguage";
import { AppContext } from "./AppContext";
import editStyles from "./Edit.module.css";
import GraphProvider from "./GraphProvider";
import Loading from "./Loading";
import { stringify } from "gray-matter";
import useGraphOptions from "./useGraphOptions";
import { useDebouncedCallback } from "use-debounce";
import { useMutation } from "react-query";
import styles from "./EditUserChart.module.css";
import Spinner from "./Spinner";
import { Check, Timer } from "phosphor-react";
import { useIsValidSponsor } from "../hooks";
import HasError from "./HasError";

export default function EditUserChart() {
  const validSponsor = useIsValidSponsor();
  const { id } = useParams<{ id?: string }>();
  const { data } = useChart(id);
  const [text, setText] = useState(data?.chart ?? "");
  const [textToParse, setTextToParse] = useReducer(
    (t: string, u: string) => u,
    text as string
  );
  const lastText = useRef(text);
  const setTextToParseThrottle = useThrottleCallback(setTextToParse, 2);
  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  const editorRef = useRef<null | Parameters<OnMount>[0]>(null);
  const { mode, hasError, hasStyleError } = useContext(AppContext);
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

  const monaco = useMonaco();
  // Add language
  useMonacoLanguage(monaco);

  const onMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      defineThemes(monaco, mode);
    },
    [mode]
  );

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

  const decorations = useRef<any[]>([]);

  // Hover
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
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
    }
  }, [hoverLineNumber]);

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
        onChange={(value) => setText(value ?? "")}
        loading={loading.current}
        onMount={onMount}
      />
      <div className={styles.LoadingState}>
        {pending() ? (
          <Timer size={28} color="var(--color-edgeHover)" />
        ) : isLoading ? (
          <Spinner r={10} s={2} c="var(--palette-purple-0)" />
        ) : (
          <Check size={30} color="var(--palette-green-0)" />
        )}
      </div>
      <HasError show={hasError || hasStyleError} />
    </GraphProvider>
  );
}
