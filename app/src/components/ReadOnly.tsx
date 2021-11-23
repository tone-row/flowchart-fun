import Editor, { OnMount } from "@monaco-editor/react";
import matter from "gray-matter";
import { decompressFromEncodedURIComponent as decompress } from "lz-string";
import { useContext, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { delimiters, editorOptions } from "../lib/constants";
import { useEditorHover, useEditorOnMount } from "../lib/editorHooks";
import {
  languageId,
  themeNameDark,
  themeNameLight,
} from "../lib/registerLanguage";
import { AppContext } from "./AppContext";
import GraphProvider from "./GraphProvider";
import HasError from "./HasError";
import Loading from "./Loading";
import styles from "./ReadOnly.module.css";

function ReadOnly({ compressed = false }: { compressed?: boolean }) {
  const { graphText = window.location.hash.slice(1) } = useParams<{
    graphText: string;
  }>();
  const textToParse = compressed
    ? decompress(graphText) ?? ""
    : decodeURIComponent(graphText);
  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  const editorRef = useRef<null | Parameters<OnMount>[0]>(null);
  const { mode, hasError, hasStyleError } = useContext(AppContext);
  const loading = useRef(<Loading />);

  const onMount = useEditorOnMount(mode, editorRef);
  useEditorHover(editorRef, hoverLineNumber);

  const { data: graphOptions } = matter(textToParse, { delimiters });

  return (
    <GraphProvider
      editable={false}
      setHoverLineNumber={setHoverLineNumber}
      textToParse={textToParse}
      graphOptions={graphOptions}
    >
      <Editor
        value={textToParse}
        wrapperClassName={styles.Editor}
        defaultLanguage={languageId}
        options={{
          ...editorOptions,
          readOnly: true,
        }}
        defaultValue={textToParse}
        theme={mode === "dark" ? themeNameDark : themeNameLight}
        loading={loading.current}
        onMount={onMount}
      />
      <HasError show={hasError || hasStyleError} />
    </GraphProvider>
  );
}

export default ReadOnly;
