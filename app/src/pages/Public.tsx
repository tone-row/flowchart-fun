import Editor, { OnMount, useMonaco } from "@monaco-editor/react";
import strip from "@tone-row/strip-comments";
import matter from "gray-matter";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { AppContext } from "../components/AppContext";
import GraphProvider from "../components/GraphProvider";
import Loading from "../components/Loading";
import { delimiters, editorOptions } from "../lib/constants";
import { useEditorOnMount } from "../lib/editorHooks";
import { usePublicChart } from "../lib/queries";
import {
  languageId,
  themeNameDark,
  themeNameLight,
  useMonacoLanguage,
} from "../lib/registerLanguage";
import { getTextAndHiddenGraphOptions } from "./getTextAndHiddenGraphOptions";
import styles from "./ReadOnly.module.css";

function Public() {
  const monaco = useMonaco();
  const { public_id } = useParams<{ public_id: string }>();
  const { data } = usePublicChart(public_id);
  const { text: textToParse, hiddenGraphOptions } =
    getTextAndHiddenGraphOptions(data?.chart ?? "");
  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  const editorRef = useRef<null | Parameters<OnMount>[0]>(null);
  const monacoRef = useRef<any>();
  const decorations = useRef<any[]>([]);
  const { mode } = useContext(AppContext);

  useMonacoLanguage(monaco);

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

  const { data: graphOptions } = matter(strip(textToParse), { delimiters });

  const loading = useRef(<Loading />);
  const onMount = useEditorOnMount(editorRef, monacoRef);

  return (
    <GraphProvider
      editable={false}
      setHoverLineNumber={setHoverLineNumber}
      textToParse={textToParse}
      graphOptions={graphOptions}
      hiddenGraphOptions={hiddenGraphOptions}
    >
      <Editor
        value={textToParse}
        defaultValue={textToParse}
        defaultLanguage={languageId}
        // @ts-ignore
        wrapperClassName={styles.Editor}
        theme={mode === "dark" ? themeNameDark : themeNameLight}
        loading={loading.current}
        options={{
          ...editorOptions,
          readOnly: true,
        }}
        onMount={onMount}
      />
    </GraphProvider>
  );
}

export default Public;
