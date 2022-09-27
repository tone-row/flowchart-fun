import Editor, { OnMount, useMonaco } from "@monaco-editor/react";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { AppContext } from "../components/AppContext";
import Loading from "../components/Loading";
import Main from "../components/Main";
import { editorOptions } from "../lib/constants";
import { useEditorOnMount } from "../lib/editorHooks";
import {
  languageId,
  themeNameDark,
  themeNameLight,
  useMonacoLanguage,
} from "../lib/registerLanguage";
import { useHostedDoc } from "../lib/useHostedDoc";
import styles from "./ReadOnly.module.css";

function Public() {
  const monaco = useMonaco();
  const { public_id } = useParams<{ public_id: string }>();
  const { options, toParse, hiddenGraphOptionsText, theme, bg } =
    useHostedDoc(public_id);
  const { graphOptions } = options;

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

  return (
    <Main
      setHoverLineNumber={setHoverLineNumber}
      textToParse={toParse}
      hiddenGraphOptionsText={hiddenGraphOptionsText}
      options={options}
      theme={theme}
      bg={bg}
    >
      <Editor
        value={toParse}
        defaultValue={toParse}
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
