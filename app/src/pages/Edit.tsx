import * as Tabs from "@radix-ui/react-tabs";
import throttle from "lodash.throttle";
import { editor } from "monaco-editor";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouteMatch } from "react-router-dom";

import { ClearTextButton } from "../components/ClearTextButton";
import EditorError from "../components/EditorError";
import { EditorOptions } from "../components/EditorOptions";
import { EditorWrapper } from "../components/EditorWrapper";
import { EditWrapper } from "../components/EditWrapper";
import Main from "../components/Main";
import { EditLayoutTab } from "../components/Tabs/EditLayoutTab";
import { EditMetaTab } from "../components/Tabs/EditMetaTab";
import { EditorTabList } from "../components/Tabs/EditorTabList";
import { EditStyleTab } from "../components/Tabs/EditStyleTab";
import { TextEditor } from "../components/TextEditor";
import { getDefaultChart } from "../lib/getDefaultChart";
import { titleToLocalStorageKey } from "../lib/helpers";
import { useIsValidSponsor } from "../lib/hooks";
import { prepareChart } from "../lib/prepareChart/prepareChart";
import { Doc, docToString, useDoc } from "../lib/useDoc";
import { useTrackLastChart } from "../lib/useLastChart";
import styles from "./Edit.module.css";

const Edit = memo(function Edit({ workspace }: { workspace: string }) {
  const editorRef = useRef<null | editor.IStandaloneCodeEditor>(null);

  const isValidSponsor = useIsValidSponsor();

  const storeDoc = useMemo(() => {
    return throttle(
      (doc: Doc) => {
        const docString = docToString(doc);
        if (docString === getDefaultChart()) return;
        const key = titleToLocalStorageKey(workspace);
        localStorage.setItem(key, docString);
      },
      1000,
      { trailing: true }
    );
  }, [workspace]);

  useEffect(() => useDoc.subscribe(storeDoc), [storeDoc]);

  const onChange = useCallback(
    (value) => useDoc.setState({ text: value ?? "" }, false, "Edit/text"),
    []
  );

  const { url } = useRouteMatch();
  useTrackLastChart(url);

  const text = useDoc((d) => d.text);

  return (
    <EditWrapper>
      <Main>
        <EditorWrapper>
          <Tabs.Root defaultValue="Document" className={styles.Tabs}>
            <EditorTabList />
            <Tabs.Content value="Document">
              <EditorOptions>
                <TextEditor
                  editorRef={editorRef}
                  value={text}
                  onChange={onChange}
                />
              </EditorOptions>
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
            useDoc.setState({ text: "", meta: {} }, false, "Edit/clear");
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

/**
 * This is a wrapper component that loads the workspace into our zustand store
 */
function EditOuter() {
  const [loaded, setLoaded] = useState(false);
  const { workspace = "" } = useParams<{ workspace?: string }>();
  useEffect(() => {
    loadWorkspace(workspace);
    setLoaded(true);
  }, [workspace]);
  if (!loaded) return null;
  return <Edit key={workspace} workspace={workspace} />;
}

export default EditOuter;

/**
 * Load the workspace into our zustand store
 */
function loadWorkspace(workspace: string) {
  const key = titleToLocalStorageKey(workspace);
  let workspaceText = localStorage.getItem(key);
  if (!workspaceText) {
    workspaceText = getDefaultChart();
  }

  prepareChart(workspaceText, {
    id: workspace,
    title: workspace,
    isHosted: false,
  });

  return workspaceText;
}
