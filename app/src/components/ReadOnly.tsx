import React, { useContext, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router";
import ResizableLayout from "./ResizableLayout";
import { AppContext } from "./AppContext";
import UnmountDeclare from "./UnmountDeclare";
import { decompressFromEncodedURIComponent as decompress } from "lz-string";
import { editorOptions } from "../constants";

function ReadOnly({ compressed = false }: { compressed?: boolean }) {
  const { graphText } = useParams<{ graphText: string }>();
  const textToParse = compressed
    ? decompress(graphText) ?? ""
    : decodeURIComponent(graphText);
  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  const editorRef = useRef(null);
  const decorations = useRef<any[]>([]);
  const { mode, setIsReady } = useContext(AppContext);

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
    <ResizableLayout
      setHoverLineNumber={setHoverLineNumber}
      textToParse={textToParse}
    >
      <Editor
        defaultValue={textToParse}
        value={textToParse}
        theme={mode === "dark" ? "vs-dark" : "light"}
        loading={<UnmountDeclare />}
        options={{
          ...editorOptions,
          readOnly: true,
        }}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          setIsReady();
        }}
      />
    </ResizableLayout>
  );
}

export default ReadOnly;
