import React, { useContext, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router";
import { AppContext } from "./AppContext";
import { decompressFromEncodedURIComponent as decompress } from "lz-string";
import { editorOptions, GraphOptionsObject } from "../constants";
import Loading from "./Loading";
import WithGraphWrapper from "./WithGraph";
import matter from "gray-matter";

function ReadOnly({ compressed = false }: { compressed?: boolean }) {
  const { graphText } = useParams<{ graphText: string }>();
  const textToParse = compressed
    ? decompress(graphText) ?? ""
    : decodeURIComponent(graphText);
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
  }, [hoverLineNumber]);

  const { data: graphOptions } = matter(textToParse, { delimiters: "~~~" });

  return (
    <WithGraphWrapper
      editable={false}
      setHoverLineNumber={setHoverLineNumber}
      textToParse={textToParse}
      updateGraphOptionsText={(_n: GraphOptionsObject) => {}}
      graphOptions={graphOptions}
    >
      <Editor
        defaultValue={textToParse}
        value={textToParse}
        theme={mode === "dark" ? "vs-dark" : "light"}
        loading={<Loading />}
        options={{
          ...editorOptions,
          readOnly: true,
        }}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
        }}
      />
    </WithGraphWrapper>
  );
}

export default ReadOnly;
