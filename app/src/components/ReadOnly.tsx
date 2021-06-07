import React, { useContext, useEffect, useRef, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useParams } from "react-router";
import { AppContext } from "./AppContext";
import { decompressFromEncodedURIComponent as decompress } from "lz-string";
import { delimiters, editorOptions } from "../constants";
import Loading from "./Loading";
import GraphProvider from "./GraphProvider";
import matter from "gray-matter";

function ReadOnly({ compressed = false }: { compressed?: boolean }) {
  const { graphText = window.location.hash.slice(1) } = useParams<{
    graphText: string;
  }>();
  const textToParse = compressed
    ? decompress(graphText) ?? ""
    : decodeURIComponent(graphText);
  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  const editorRef = useRef<null | Parameters<OnMount>[0]>(null);
  const decorations = useRef<any[]>([]);
  const { mode } = useContext(AppContext);

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      if (typeof hoverLineNumber === "number" && editor) {
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

  const { data: graphOptions } = matter(textToParse, { delimiters });

  return (
    <GraphProvider
      editable={false}
      setHoverLineNumber={setHoverLineNumber}
      textToParse={textToParse}
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
        onMount={(editor) => {
          editorRef.current = editor;
        }}
      />
    </GraphProvider>
  );
}

export default ReadOnly;
