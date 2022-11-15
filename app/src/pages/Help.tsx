import Editor, { OnMount } from "@monaco-editor/react";
import { Resizable } from "re-resizable";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import Docs from "../components/Docs";
import EditorError from "../components/EditorError";
import { EditWrapper } from "../components/EditWrapper";
import Loading from "../components/Loading";
import Main from "../components/Main";
import { editorOptions } from "../lib/constants";
import { useEditorHover, useEditorOnMount } from "../lib/editorHooks";
import { useAppMode } from "../lib/queries";
import {
  languageId,
  themeNameDark,
  themeNameLight,
} from "../lib/registerLanguage";
import { useLocalDoc } from "../lib/useLocalDoc";
import styles from "./Edit.module.css";
import helpStyles from "./Help.module.css";

export default function Help() {
  const {
    text,
    hiddenGraphOptionsText,
    options,
    updateDoc,
    theme,
    bg,
    isFrozen,
    fullText,
  } = useLocalDoc("h"); // fixed workspace name
  const { linesOfYaml } = options;

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

  // Hover
  useEditorHover(editorRef, hoverLineNumber && hoverLineNumber + linesOfYaml);

  useEffect(() => {
    window.flowchartFunSetHelpText = (text: string) => updateDoc({ text });
    return () => {
      delete window.flowchartFunSetHelpText;
    };
  }, [updateDoc]);

  const onChange = useCallback(
    (value) => updateDoc({ text: value ?? "" }),
    [updateDoc]
  );

  return (
    <EditWrapper>
      <Main
        setHoverLineNumber={setHoverLineNumber}
        hiddenGraphOptionsText={hiddenGraphOptionsText}
        options={options}
        theme={theme}
        bg={bg}
        isFrozen={isFrozen}
        fullText={fullText}
        update={updateDoc}
      >
        <div className={helpStyles.helpWrapper} data-testid="help">
          <Resizable
            defaultSize={{ width: "100%", height: "50vh" }}
            className={helpStyles.resizable}
            enable={{
              top: false,
              right: false,
              bottom: true,
              left: false,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false,
            }}
          >
            <div className={helpStyles.docsWrapper}>
              <div className={helpStyles.docsWrapperScroll}>
                <Suspense fallback={<Loading />}>
                  <Docs currentText={text} />
                </Suspense>
              </div>
            </div>
          </Resizable>
          <Editor
            value={text}
            // @ts-ignore
            wrapperClassName={styles.Editor}
            defaultLanguage={languageId}
            options={editorOptions}
            onChange={onChange}
            loading={loading.current}
            onMount={onMount}
          />
        </div>
        <EditorError />
      </Main>
    </EditWrapper>
  );
}

declare global {
  interface Window {
    flowchartFunSetHelpText?: (text: string) => void;
  }
}
