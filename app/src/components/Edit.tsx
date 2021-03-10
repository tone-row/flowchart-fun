import React, { useEffect, useReducer, useRef, useState } from "react";
import { useThrottleCallback } from "@react-hook/throttle";
import useLocalStorage from "react-use-localstorage";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router";
import { defaultText } from "../constants";
import Layout from "./Layout";

function Edit() {
  const { workspace = "" } = useParams<{ workspace?: string }>();
  const [textarea, setText] = useLocalStorage(
    ["flowcharts.fun", workspace].filter(Boolean).join(":"),
    defaultText
  );
  const [textToParse, setTextToParse] = useReducer(
    (t: string, u: string) => u,
    textarea
  );
  const setTextToParseThrottle = useThrottleCallback(setTextToParse, 2);
  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  const editorRef = useRef(null);
  const decorations = useRef<any[]>([]);

  useEffect(() => {
    // @ts-ignore
    window.flowchartFunSetText = setText;

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

    return () => {
      // @ts-ignore
      delete window.flowchartFunSetText;
    };
  }, [hoverLineNumber, setText]);

  useEffect(() => {
    setTextToParseThrottle(textarea);
  }, [textarea, setTextToParseThrottle]);

  return (
    <Layout setHoverLineNumber={setHoverLineNumber} textToParse={textToParse}>
      <Editor
        defaultValue={textarea}
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          tabSize: 2,
          insertSpaces: true,
          wordBasedSuggestions: false,
          occurrencesHighlight: false,
          renderLineHighlight: false,
          highlightActiveIndentGuide: false,
          scrollBeyondLastLine: false,
          renderIndentGuides: false,
          overviewRulerBorder: false,
          lineDecorationsWidth: "10px",
          renderValidationDecorations: "off",
          hideCursorInOverviewRuler: true,
          matchBrackets: "never",
          selectionHighlight: false,
          lineHeight: 28,
        }}
        onChange={(value) => value && setText(value)}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
        }}
      />
    </Layout>
  );
}

export default Edit;
