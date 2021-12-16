import Editor, { OnMount } from "@monaco-editor/react";
import matter from "gray-matter";
import { useContext, useRef, useState } from "react";

import { delimiters, editorOptions } from "../lib/constants";
import { useEditorHover, useEditorOnMount } from "../lib/editorHooks";
import { useReadOnlyText } from "../lib/hooks";
import {
  languageId,
  themeNameDark,
  themeNameLight,
} from "../lib/registerLanguage";
import { AppContext } from "./AppContext";
import EditorError from "./EditorError";
import GraphProvider from "./GraphProvider";
import Loading from "./Loading";
import styles from "./ReadOnly.module.css";

function ReadOnly() {
  const textToParse = useReadOnlyText();
  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  const editorRef = useRef<null | Parameters<OnMount>[0]>(null);
  const { mode } = useContext(AppContext);
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
      <EditorError />
    </GraphProvider>
  );
}

export default ReadOnly;
