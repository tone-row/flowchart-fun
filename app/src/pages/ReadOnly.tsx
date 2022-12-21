import Editor, { OnMount } from "@monaco-editor/react";
import { decompressFromEncodedURIComponent } from "lz-string";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useParams, useRouteMatch } from "react-router-dom";

import EditorError from "../components/EditorError";
import { EditorWrapper } from "../components/EditorWrapper";
import { EditWrapper } from "../components/EditWrapper";
import Loading from "../components/Loading";
import Main from "../components/Main";
import { editorOptions } from "../lib/constants";
import { useEditorHover, useEditorOnMount } from "../lib/editorHooks";
import { prepareChart, useDoc } from "../lib/prepareChart";
import { useAppMode } from "../lib/queries";
import {
  languageId,
  themeNameDark,
  themeNameLight,
} from "../lib/registerLanguage";
import styles from "./ReadOnly.module.css";

function ReadOnly() {
  const { path } = useRouteMatch();
  const { graphText = window.location.hash.slice(1) } = useParams<{
    graphText: string;
  }>();
  useQuery(["read", path, graphText], () => loadReadOnly(path, graphText), {
    enabled: typeof graphText === "string",
    suspense: true,
    staleTime: 0,
  });
  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  const editorRef = useRef<null | Parameters<OnMount>[0]>(null);
  const monacoRef = useRef<any>();
  const { data: mode } = useAppMode();
  const loading = useRef(<Loading />);

  const onMount = useEditorOnMount(editorRef, monacoRef);
  useEffect(() => {
    if (!monacoRef.current) return;
    monacoRef.current.editor.setTheme(
      mode === "light" ? themeNameLight : themeNameDark
    );
  }, [mode]);

  useEditorHover(editorRef, hoverLineNumber && hoverLineNumber);
  const text = useDoc((d) => d.text);

  return (
    <EditWrapper>
      <Main setHoverLineNumber={setHoverLineNumber}>
        <EditorWrapper>
          <Editor
            value={text}
            // @ts-ignore
            wrapperClassName={styles.Editor}
            defaultLanguage={languageId}
            options={{
              ...editorOptions,
              readOnly: true,
            }}
            defaultValue={text}
            theme={mode === "dark" ? themeNameDark : themeNameLight}
            loading={loading.current}
            onMount={onMount}
          />
        </EditorWrapper>
        <EditorError />
      </Main>
    </EditWrapper>
  );
}

export default ReadOnly;

async function loadReadOnly(path: string, graphText: string) {
  const isCompressed = [
    "/c/:graphText?",
    "/f/:graphText?",
    "/n/:graphText?",
  ].includes(path);
  const initialText = isCompressed
    ? decompressFromEncodedURIComponent(graphText) ?? ""
    : decodeURIComponent(graphText);
  prepareChart(initialText, {
    isHosted: false,
    id: "read",
    title: "read-only-flowchart",
  });
  return initialText;
}
