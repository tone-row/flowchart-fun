import Editor, { OnMount, useMonaco } from "@monaco-editor/react";
import { useContext, useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { AppContext } from "../components/AppContext";
import Loading from "../components/Loading";
import Main from "../components/Main";
import { editorOptions } from "../lib/constants";
import { useEditorOnMount } from "../lib/editorHooks";
import { prepareChart, useDoc } from "../lib/prepareChart";
import { getPublicChart } from "../lib/queries";
import {
  languageId,
  themeNameDark,
  themeNameLight,
  useMonacoLanguage,
} from "../lib/registerLanguage";
import styles from "./ReadOnly.module.css";

function Public() {
  const { public_id } = useParams<{ public_id: string }>();
  useQuery(["useHostedDoc", public_id], () => loadPublicDoc(public_id), {
    enabled: typeof public_id === "string",
    suspense: true,
  });

  const monaco = useMonaco();

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

  const loading = useRef(<Loading />);
  const onMount = useEditorOnMount(editorRef, monacoRef);
  const text = useDoc((doc) => doc.text);

  return (
    <Main setHoverLineNumber={setHoverLineNumber}>
      <Editor
        value={text}
        defaultValue={text}
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
    </Main>
  );
}

export default Public;

async function loadPublicDoc(id: string) {
  const chart = await getPublicChart(id);
  if (!chart) throw new Error("Chart not found");
  const doc = chart.chart;
  prepareChart(doc, {
    isHosted: true,
    title: doc.name,
    id: doc.id,
  });
  return doc;
}
