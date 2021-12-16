import Editor, { OnMount } from "@monaco-editor/react";
import { useThrottleCallback } from "@react-hook/throttle";
import merge from "deepmerge";
import { stringify } from "gray-matter";
import {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import {
  delimiters,
  editorOptions,
  GraphOptionsObject,
} from "../lib/constants";
import { useEditorHover, useEditorOnMount } from "../lib/editorHooks";
import { useLocalStorageText } from "../lib/hooks";
import { languageId } from "../lib/registerLanguage";
import { AppContext } from "./AppContext";
import styles from "./Edit.module.css";
import EditorError from "./EditorError";
import GraphProvider from "./GraphProvider";
import { HelpButton } from "./HelpButton";
import Loading from "./Loading";
import useGraphOptions from "./useGraphOptions";

export default function Edit() {
  const [text, setText, defaultText] = useLocalStorageText();
  const [textToParse, setTextToParse] = useReducer(
    (t: string, u: string) => u,
    text
  );
  const setTextToParseThrottle = useThrottleCallback(setTextToParse, 2);
  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  const editorRef = useRef<null | Parameters<OnMount>[0]>(null);
  const { mode } = useContext(AppContext);
  const loading = useRef(<Loading />);
  const { graphOptions, content, graphOptionsString } =
    useGraphOptions(textToParse);
  useEffect(() => {
    setTextToParseThrottle(text);
  }, [text, setTextToParseThrottle]);

  const onMount = useEditorOnMount(mode, editorRef);

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

  const setHelpText = useCallback(() => {
    const optionsString = graphOptionsString
      ? `${delimiters}${graphOptionsString}\n${delimiters}\n`
      : "";
    if (!content.includes(defaultText)) {
      setText([optionsString, defaultText, content].filter(Boolean).join("\n"));
    }
  }, [content, defaultText, graphOptionsString, setText]);

  useEffect(() => {
    window.flowchartFunSetHelpText = setHelpText;
    return () => {
      delete window.flowchartFunSetHelpText;
    };
  }, [setHelpText]);

  const onChange = useCallback((value) => setText(value ?? ""), [setText]);

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
        wrapperClassName={styles.Editor}
        defaultLanguage={languageId}
        options={editorOptions}
        onChange={onChange}
        loading={loading.current}
        onMount={onMount}
      />
      <HelpButton />
      <EditorError />
    </GraphProvider>
  );
}

declare global {
  interface Window {
    flowchartFunSetHelpText?: () => void;
    plausible: any;
  }
}
