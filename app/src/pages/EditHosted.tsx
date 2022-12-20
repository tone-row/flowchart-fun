import Editor, { OnMount } from "@monaco-editor/react";
import * as Tabs from "@radix-ui/react-tabs";
import { Check, DotsThree } from "phosphor-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useParams, useRouteMatch } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";

import { ClearTextButton } from "../components/ClearTextButton";
import EditorError from "../components/EditorError";
import { EditorWrapper } from "../components/EditorWrapper";
import { EditWrapper } from "../components/EditWrapper";
import Loading from "../components/Loading";
import Main from "../components/Main";
import Spinner from "../components/Spinner";
import { EditLayoutTab } from "../components/Tabs/EditLayoutTab";
import { EditMetaTab } from "../components/Tabs/EditMetaTab";
import { EditStyleTab } from "../components/Tabs/EditStyleTab";
import { editorOptions } from "../lib/constants";
import { useEditorHover, useEditorOnMount } from "../lib/editorHooks";
import { useIsValidSponsor } from "../lib/hooks";
import { Doc, docToString, prepareChart, useDoc } from "../lib/prepareChart";
import {
  getHostedChart,
  queryClient,
  updateChartText,
  useAppMode,
} from "../lib/queries";
import {
  languageId,
  themeNameDark,
  themeNameLight,
} from "../lib/registerLanguage";
import { useTrackLastChart } from "../lib/useLastChart";
import editStyles from "./Edit.module.css";
import styles from "./EditHosted.module.css";

export default function EditHosted() {
  const { id } = useParams<{ id: string }>();
  useQuery(["useHostedDoc", id], () => loadHostedDoc(id), {
    enabled: !!id,
    suspense: true,
    staleTime: 0,
  });

  const { mutate, isLoading } = useMutation((text: string) =>
    updateChartText(text, id)
  );
  // get debounced mutate
  const {
    callback: debounceMutate,
    flush,
    pending,
  } = useDebouncedCallback((doc: Doc) => {
    mutate(docToString(doc));
  }, 1000);
  useEffect(() => useDoc.subscribe(debounceMutate), [debounceMutate]);

  const text = useDoc((state) => state.text);

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

  // Hover
  useEditorHover(editorRef, hoverLineNumber && hoverLineNumber);

  const onChange = useCallback(
    (value) => useDoc.setState({ text: value ?? "" }),
    []
  );

  const { url } = useRouteMatch();
  useTrackLastChart(url);
  const isValidSponsor = useIsValidSponsor();

  return (
    <EditWrapper>
      <Main setHoverLineNumber={setHoverLineNumber}>
        <EditorWrapper>
          <Tabs.Root defaultValue="Document" className={editStyles.Tabs}>
            <Tabs.List className={editStyles.TabsList}>
              <Tabs.Trigger value="Document">Document</Tabs.Trigger>
              <Tabs.Trigger value="Layout">Layout</Tabs.Trigger>
              <Tabs.Trigger value="Style">Style</Tabs.Trigger>
              {isValidSponsor && (
                <Tabs.Trigger value="Advanced">Advanced</Tabs.Trigger>
              )}
            </Tabs.List>
            <Tabs.Content value="Document">
              <Editor
                value={text}
                // @ts-ignore
                wrapperClassName={editStyles.Editor}
                defaultLanguage={languageId}
                options={editorOptions}
                onChange={onChange}
                loading={loading.current}
                onMount={onMount}
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
        <LoadingState isLoading={isLoading} pending={pending()} />
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
}

/**
 * Shows whether the chart has synced to the server
 */
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

async function loadHostedDoc(id: string) {
  const chart = await getHostedChart(id);
  if (!chart) throw new Error("Chart not found");
  const doc = chart.chart;
  prepareChart(doc);
  return doc;
}
