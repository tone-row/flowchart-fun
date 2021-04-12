import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useThrottleCallback } from "@react-hook/throttle";
import useLocalStorage from "react-use-localstorage";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router";
import { defaultText, editorOptions, GraphOptionsObject } from "../constants";
import { AppContext } from "./AppContext";
import Loading from "./Loading";
import WithGraphWrapper from "./WithGraph";
import matter, { stringify } from "gray-matter";
import useGraphOptions from "./useGraphOptions";

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
  const { mode } = useContext(AppContext);

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

    return () => {
      // @ts-ignore
      delete window.flowchartFunSetText;
    };
  }, [hoverLineNumber, setText]);

  useEffect(() => {
    setTextToParseThrottle(textarea);
  }, [textarea, setTextToParseThrottle]);

  const graphOptions = useGraphOptions(textToParse);

  const updateGraphOptionsText = useCallback(
    (o: GraphOptionsObject) => {
      const { data, content } = matter(textToParse, { delimiters: "~~~" });
      let text = "";
      if (Object.keys(data).length) {
        text = stringify(content, { ...data, ...o }, { delimiters: "~~~" });
      } else {
        // No frontmatter
        text = stringify(textToParse, o, { delimiters: "~~~" });
      }
      setText(text);
      setTextToParse(text);
    },
    [setText, textToParse]
  );

  return (
    <WithGraphWrapper
      editable={true}
      textToParse={textToParse}
      setHoverLineNumber={setHoverLineNumber}
      graphOptions={graphOptions}
      updateGraphOptionsText={updateGraphOptionsText}
    >
      <Editor
        defaultValue={textarea}
        options={editorOptions}
        theme={mode === "dark" ? "vs-dark" : "light"}
        onChange={(value) => setText(value ?? "")}
        loading={<Loading />}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
        }}
      />
    </WithGraphWrapper>
  );
}

export default Edit;
