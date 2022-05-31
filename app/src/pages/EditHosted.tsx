import Editor, { OnMount } from "@monaco-editor/react";
import { useThrottleCallback } from "@react-hook/throttle";
import { compressToEncodedURIComponent } from "lz-string";
import { Check, DotsThree } from "phosphor-react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import { useParams } from "react-router";
import { useDebouncedCallback } from "use-debounce";

import { AppContext } from "../components/AppContext";
import EditorError from "../components/EditorError";
import GraphProvider from "../components/GraphProvider";
import Loading from "../components/Loading";
import Spinner from "../components/Spinner";
import useGraphOptions from "../components/useGraphOptions";
import { editorOptions, HIDDEN_GRAPH_OPTIONS_DIVIDER } from "../lib/constants";
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
import { useUpdateGraphOptionsText } from "../lib/useUpdateGraphOptionsText";
import editStyles from "./Edit.module.css";
import styles from "./EditHosted.module.css";
import { getTextAndHiddenGraphOptions } from "./getTextAndHiddenGraphOptions";

export default function EditHosted() {
  const validSponsor = useIsValidSponsor();
  const { id } = useParams<{ id?: string }>();
  const { data } = useChart(id);
  const { text: _text, hiddenGraphOptions: _hiddenGraphOptions } =
    getTextAndHiddenGraphOptions(data?.chart ?? "");
  const [text, setText] = useState(_text ?? "");
  const [hiddenGraphOptions, setHiddenGraphOptions] =
    useState(_hiddenGraphOptions);
  const hiddenGraphOptionsString = JSON.stringify(hiddenGraphOptions);
  const [textToParse, setTextToParse] = useState(text);
  const fullText = mergeTextAndHiddenGraphOptions(
    text,
    hiddenGraphOptionsString
  );
  const lastText = useRef(fullText);
  const setTextToParseThrottle = useThrottleCallback(setTextToParse, 2, true);
  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  const editorRef = useRef<null | Parameters<OnMount>[0]>(null);
  const monacoRef = useRef<any>();
  const { data: mode } = useAppMode();
  const loading = useRef(<Loading />);
  const { graphOptions, content, linesOfYaml } = useGraphOptions(textToParse);

  const { mutate, isLoading } = useMutation((currentText: string) =>
    updateChartText(currentText, id)
  );
  const {
    callback: debouncedUpdate,
    flush,
    pending,
  } = useDebouncedCallback((currentText: string) => {
    mutate(currentText);
  }, 1000);

  const { setShareLink } = useContext(AppContext);
  useEffect(() => {
    setShareLink(compressToEncodedURIComponent(fullText));
  }, [fullText, setShareLink]);

  useEffect(() => {
    if (lastText.current !== fullText) {
      debouncedUpdate(fullText);
      lastText.current = fullText;
    }
  }, [debouncedUpdate, fullText]);

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

  const updateGraphOptionsText = useUpdateGraphOptionsText(
    content,
    graphOptions,
    setText,
    setTextToParse,
    textToParse
  );

  // Hover
  useEditorHover(editorRef, hoverLineNumber && hoverLineNumber + linesOfYaml);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChange = useCallback((value) => setText(value ?? ""), []);

  return (
    <GraphProvider
      editable={true}
      textToParse={textToParse}
      setHoverLineNumber={setHoverLineNumber}
      graphOptions={graphOptions}
      updateGraphOptionsText={updateGraphOptionsText}
      linesOfYaml={linesOfYaml}
      hiddenGraphOptions={hiddenGraphOptions}
      setHiddenGraphOptions={setHiddenGraphOptions}
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
        <DotsThree size={18} color="var(--palette-purple-0)" />
      ) : isLoading ? (
        <Spinner r={4} s={1} c="var(--palette-purple-0)" />
      ) : (
        <Check size={17} color="var(--palette-purple-0)" />
      )}
    </div>
  );
}

function mergeTextAndHiddenGraphOptions(
  text: string,
  hiddenGraphOptions: string
) {
  if (!hiddenGraphOptions) return text;
  return `${text}${HIDDEN_GRAPH_OPTIONS_DIVIDER}${hiddenGraphOptions}`;
}
