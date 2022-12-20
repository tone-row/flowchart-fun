import Editor, { OnMount } from "@monaco-editor/react";
import * as Tabs from "@radix-ui/react-tabs";
import throttle from "lodash.throttle";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useParams, useRouteMatch } from "react-router-dom";

import { ClearTextButton } from "../components/ClearTextButton";
import EditorError from "../components/EditorError";
import { EditorWrapper } from "../components/EditorWrapper";
import { EditWrapper } from "../components/EditWrapper";
import Loading from "../components/Loading";
import Main from "../components/Main";
import { EditLayoutTab } from "../components/Tabs/EditLayoutTab";
import { EditMetaTab } from "../components/Tabs/EditMetaTab";
import { EditStyleTab } from "../components/Tabs/EditStyleTab";
import { editorOptions } from "../lib/constants";
import { useEditorHover, useEditorOnMount } from "../lib/editorHooks";
import { titleToLocalStorageKey } from "../lib/helpers";
import { useIsValidSponsor } from "../lib/hooks";
import { Doc, docToString, prepareChart, useDoc } from "../lib/prepareChart";
import { getDefaultText, useAppMode } from "../lib/queries";
import {
  languageId,
  themeNameDark,
  themeNameLight,
} from "../lib/registerLanguage";
import { useTrackLastChart } from "../lib/useLastChart";
import styles from "./Edit.module.css";

const Edit = memo(function Edit() {
  const isValidSponsor = useIsValidSponsor();
  const { workspace = "" } = useParams<{ workspace?: string }>();

  useQuery(["edit", workspace], () => loadWorkspace(workspace), {
    enabled: typeof workspace === "string",
    suspense: true,
    staleTime: 0,
  });

  const store = useMemo(() => {
    return throttle(
      (doc: Doc) => {
        const docString = docToString(doc);
        if (docString === getDefaultText()) return;
        const key = titleToLocalStorageKey(workspace);
        localStorage.setItem(key, docString);
      },
      1000,
      { trailing: true }
    );
  }, [workspace]);

  useEffect(() => useDoc.subscribe(store), [store]);

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
  useEditorHover(editorRef, hoverLineNumber && hoverLineNumber);

  const onChange = useCallback(
    (value) => useDoc.setState({ text: value ?? "" }),
    []
  );

  const { url } = useRouteMatch();
  useTrackLastChart(url);

  const text = useDoc((d) => d.text);

  return (
    <EditWrapper>
      <Main setHoverLineNumber={setHoverLineNumber}>
        <EditorWrapper>
          <Tabs.Root defaultValue="Document" className={styles.Tabs}>
            <Tabs.List className={styles.TabsList}>
              <Tabs.Trigger value="Document" data-testid="Editor Tab: Document">
                Document
              </Tabs.Trigger>
              <Tabs.Trigger value="Layout" data-testid="Editor Tab: Layout">
                Layout
              </Tabs.Trigger>
              <Tabs.Trigger value="Style" data-testid="Editor Tab: Style">
                Style
              </Tabs.Trigger>
              {isValidSponsor && (
                <Tabs.Trigger
                  value="Advanced"
                  data-testid="Editor Tab: Advanced"
                >
                  Advanced
                </Tabs.Trigger>
              )}
            </Tabs.List>
            <Tabs.Content value="Document">
              <Editor
                value={text}
                defaultLanguage={languageId}
                options={editorOptions}
                onChange={onChange}
                loading={loading.current}
                onMount={onMount}
                wrapperProps={{
                  "data-testid": "Editor",
                  className: styles.EditorXYZ,
                }}
              />
            </Tabs.Content>
            <Tabs.Content value="Layout">
              <EditLayoutTab />
            </Tabs.Content>
            <Tabs.Content value="Style">
              <EditStyleTab />
            </Tabs.Content>
            {isValidSponsor && (
              <Tabs.Content value="Advanced">
                <EditMetaTab />
              </Tabs.Content>
            )}
          </Tabs.Root>
        </EditorWrapper>
        <ClearTextButton
          handleClear={() => {
            useDoc.setState({ text: "", meta: {} });
            if (editorRef.current) {
              editorRef.current.focus();
            }
          }}
        />
        <EditorError />
      </Main>
    </EditWrapper>
  );
});

export default Edit;

/**
 * Load the workspace into our zustand store
 */
async function loadWorkspace(workspace: string) {
  const key = titleToLocalStorageKey(workspace);
  let workspaceText = localStorage.getItem(key);
  if (!workspaceText) {
    workspaceText = getDefaultText();
  }

  prepareChart(workspaceText);
  return workspaceText;
}
