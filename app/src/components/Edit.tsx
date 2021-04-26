import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useThrottleCallback } from "@react-hook/throttle";
import Editor from "@monaco-editor/react";
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

declare global {
  interface Window {
    flowchartFunSetHelpText?: () => void;
  }
}

function Edit() {
  const [text, setText, defaultText] = useLocalStorageText();
  const [textToParse, setTextToParse] = useReducer(
    (t: string, u: string) => u,
    text
  );
  const setTextToParseThrottle = useThrottleCallback(setTextToParse, 2);
  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  const editorRef = useRef(null);
  const decorations = useRef<any[]>([]);
  const { mode, setShowing, showing } = useContext(AppContext);

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      if (typeof hoverLineNumber === "number") {
        //@ts-ignore
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
        // @ts-ignore
        decorations.current = editor.deltaDecorations(decorations.current, []);
      }
    }
  }, [hoverLineNumber, setText]);

  useEffect(() => {
    setTextToParseThrottle(text);
  }, [text, setTextToParseThrottle]);

  const { graphOptions, content, graphOptionsString } = useGraphOptions(
    textToParse
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

  const setHelpText = useCallback(() => {
    const contentString = content ? content : "";
    const optionsString = graphOptionsString
      ? `${delimiters}${graphOptionsString}\n${delimiters}\n`
      : "";
    console.log(contentString, defaultText);
    if (!contentString.includes(defaultText)) {
      setText(
        [optionsString, defaultText, contentString].filter(Boolean).join("\n")
      );
    }
    if (showing !== "editor") setShowing("editor");
  }, [content, defaultText, graphOptionsString, setShowing, setText, showing]);

  useEffect(() => {
    window.flowchartFunSetHelpText = setHelpText;
    return () => {
      delete window.flowchartFunSetHelpText;
    };
  }, [setHelpText]);

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
        options={editorOptions}
        theme={mode === "dark" ? "vs-dark" : "light"}
        onChange={(value) => setText(value ?? "")}
        loading={<Loading />}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
        }}
      />
      <HelpButton />
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
