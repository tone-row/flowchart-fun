import React, { useContext, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router";
import WithGraph from "./WithGraph";
import { AppContext } from "./AppContext";
import { decompressFromEncodedURIComponent as decompress } from "lz-string";
import { editorOptions } from "../constants";
import Loading from "./Loading";

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

  return (
    <WithGraph
      setHoverLineNumber={setHoverLineNumber}
      textToParse={textToParse}
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
    </WithGraph>
  );
}

export default ReadOnly;
