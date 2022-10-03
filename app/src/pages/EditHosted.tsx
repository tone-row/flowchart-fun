import Editor, { OnMount } from "@monaco-editor/react";
import { Check, DotsThree } from "phosphor-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import EditorError from "../components/EditorError";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import Main from "../components/Main";
import Spinner from "../components/Spinner";
import { editorOptions } from "../lib/constants";
import { useEditorHover, useEditorOnMount } from "../lib/editorHooks";
import { useIsValidSponsor } from "../lib/hooks";
import { queryClient, useAppMode } from "../lib/queries";
import {
  languageId,
  themeNameDark,
  themeNameLight,
} from "../lib/registerLanguage";
import { useHostedDoc } from "../lib/useHostedDoc";
import editStyles from "./Edit.module.css";
import styles from "./EditHosted.module.css";

export default function EditHosted() {
  const validSponsor = useIsValidSponsor();
  const { id } = useParams<{ id?: string }>();
  const {
    flush,
    options,
    updateHostedDoc,
    hiddenGraphOptionsText,
    isLoading,
    text,
    pending,
    theme,
    bg,
    isFrozen,
    fullText,
  } = useHostedDoc(id);
  const { linesOfYaml } = options;

  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  const editorRef = useRef<null | Parameters<OnMount>[0]>(null);
  const monacoRef = useRef<any>();
  const { data: mode } = useAppMode();
  const loading = useRef(<Loading />);

  // This is to make sure we update if people exit the tab quickly
  useEffect(() => {
    return () => {
      flush();
      queryClient.resetQueries(["useChart", id]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMount = useEditorOnMount(editorRef, monacoRef);
  useEffect(() => {
    if (!monacoRef.current) return;
    monacoRef.current.editor.setTheme(
      mode === "light" ? themeNameLight : themeNameDark
    );
  }, [mode]);

  useEffect(() => {
    if (!monacoRef.current) return;
    monacoRef.current.editor.setTheme(
      mode === "light" ? themeNameLight : themeNameDark
    );
  }, [mode]);

  // Hover
  useEditorHover(editorRef, hoverLineNumber && hoverLineNumber + linesOfYaml);

  const onChange = useCallback(
    (value) => updateHostedDoc({ text: value ?? "" }),
    [updateHostedDoc]
  );

  return (
    <Layout fullText={fullText}>
      <Main
        setHoverLineNumber={setHoverLineNumber}
        hiddenGraphOptionsText={hiddenGraphOptionsText}
        options={options}
        update={updateHostedDoc}
        theme={theme}
        bg={bg}
        isFrozen={isFrozen}
        fullText={fullText}
      >
        <Editor
          value={text}
          // @ts-ignore
          wrapperClassName={editStyles.Editor}
          defaultLanguage={languageId}
          options={{
            ...editorOptions,
            readOnly: !validSponsor,
          }}
          onChange={onChange}
          loading={loading.current}
          onMount={onMount}
        />
        <LoadingState isLoading={isLoading} pending={pending()} />
        <EditorError />
      </Main>
    </Layout>
  );
}

function LoadingState({
  pending,
  isLoading,
}: {
  pending: boolean;
  isLoading: boolean;
}) {
  return (
    <div className={styles.LoadingState}>
      {pending ? (
        <DotsThree size={18} color="var(--palette-purple-0)" />
      ) : isLoading ? (
        <Spinner r={4} s={1} c="var(--palette-purple-0)" />
      ) : (
        <Check size={17} color="var(--palette-purple-0)" />
      )}
    </div>
  );
}
