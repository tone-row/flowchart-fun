import {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useThrottleCallback } from "@react-hook/throttle";
import Editor, { OnMount, useMonaco } from "@monaco-editor/react";
import { delimiters, editorOptions, GraphOptionsObject } from "../constants";
import { AppContext } from "./AppContext";
import Loading from "./Loading";
import GraphProvider from "./GraphProvider";
import { stringify } from "gray-matter";
import useGraphOptions from "./useGraphOptions";
import merge from "deepmerge";
import { useLocalStorageText } from "../hooks";
import { Box, BoxProps } from "../slang";
import { IoMdHelp } from "react-icons/io";
import styles from "./Edit.module.css";
import { t } from "@lingui/macro";
import {
  defineThemes,
  languageId,
  useMonacoLanguage,
} from "../registerLanguage";
import HasError from "./HasError";

declare global {
  interface Window {
    flowchartFunSetHelpText?: () => void;
    plausible: any;
  }
}

function Edit() {
  const monaco = useMonaco();
  const [text, setText, defaultText] = useLocalStorageText();
  const [textToParse, setTextToParse] = useReducer(
    (t: string, u: string) => u,
    text
  );
  const setTextToParseThrottle = useThrottleCallback(setTextToParse, 2);
  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  const editorRef = useRef<null | Parameters<OnMount>[0]>(null);
  const decorations = useRef<any[]>([]);
  const { mode, hasError } = useContext(AppContext);

  // Add language
  useMonacoLanguage(monaco);

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

  useEffect(() => {
    setTextToParseThrottle(text);
  }, [text, setTextToParseThrottle]);

  const { graphOptions, content, graphOptionsString } =
    useGraphOptions(textToParse);

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

  const loading = useRef(<Loading />);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChange = useCallback((value) => setText(value ?? ""), []);
  const onMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      defineThemes(monaco, mode);
    },
    [mode]
  );

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
      <HasError show={hasError} />
    </GraphProvider>
  );
}

export default Edit;

function HelpButton(props: BoxProps) {
  return (
    <Box
      as="button"
      content="center"
      onClick={() => {
        window.flowchartFunSetHelpText && window.flowchartFunSetHelpText();
        window.plausible("Set Help Text");
      }}
      {...props}
      className={styles.HelpButton}
      title={t`Help`}
    >
      <IoMdHelp size={24} />
    </Box>
  );
}
