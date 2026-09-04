import * as Tabs from "@radix-ui/react-tabs";
import { Check, DotsThree } from "phosphor-react";
import { useCallback, useEffect } from "react";
import { useMutation, useQuery } from "react-query";
import { useLocation, useParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";

import { ClearTextButton } from "../components/ClearTextButton";
import EditorError from "../components/EditorError";
import { Actions } from "../components/Actions";
import { FlowchartHeader } from "../components/FlowchartHeader";
import WithGraph from "../components/WithGraph";
import Spinner from "../components/Spinner";
import { EditorTabList } from "../components/Tabs/EditorTabList";
import { OnChange } from "@monaco-editor/react";
import classNames from "classnames";

import { TextEditor } from "../components/TextEditor";
import { prepareChart } from "../lib/prepareChart/prepareChart";
import { getHostedChart, updateChartText } from "../lib/queries";
import { Doc, docToString, useDoc } from "../lib/useDoc";
import { useEditorStore, isInternalWrite } from "../lib/useEditorStore";
import { useTrackLastChart } from "../lib/useLastChart";
import sandboxStyles from "./Sandbox.module.css";
import styles from "./EditHosted.module.css";
import { useTabsStore } from "../lib/useTabsStore";
import {
  useCanEdit,
  useHasProAccess,
  useIsReadOnlyHostedChart,
} from "../lib/hooks";
import { ThemeTab } from "../components/Tabs/ThemeTab";
import { FlowchartLayout } from "../components/FlowchartLayout";
import { AiToolbar } from "../components/AiToolbar";
import { ReadOnlyNotice } from "../components/ReadOnlyNotice";
import { markUserEditedSinceAi, usePromptStore } from "../lib/usePromptStore";

export default function EditHosted() {
  const { id } = useParams<{ id: string }>();
  useQuery(["useHostedDoc", id], () => loadHostedDoc(id ?? ""), {
    enabled: !!id,
    suspense: true,
    staleTime: 0,
    cacheTime: 0,
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
  const canEdit = useCanEdit();
  const isReadOnly = useIsReadOnlyHostedChart();

  // Persist changes only when the user is allowed to edit this chart.
  // canEdit is undefined while customer-info loads and false for lapsed
  // Pro users — in both cases nothing may be written to the server
  // (updateChartText performs no entitlement check of its own).
  useEffect(() => {
    if (!canEdit) return;
    return useDoc.subscribe(debounceMutate);
  }, [debounceMutate, canEdit]);

  const text = useDoc((state) => state.text);

  // This is to make sure we update if people exit the tab quickly
  useEffect(() => {
    return () => {
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = useCallback<OnChange>((value) => {
    useDoc.setState({ text: value ?? "" }, false, "EditHosted/text");
    if (!isInternalWrite() && !usePromptStore.getState().isRunning) {
      markUserEditedSinceAi();
    }
  }, []);

  const url = useLocation().pathname;
  useTrackLastChart(url);
  const hasProAccess = useHasProAccess();

  const selectedTab = useTabsStore((s) => s.selectedTab);
  useEffect(() => {
    return () => {
      useTabsStore.setState({ selectedTab: "Document" });
    };
  }, []);

  return (
    <FlowchartLayout>
      <FlowchartHeader />
      {/* Switch the row template instead of leaving an empty auto track:
          Tabs.Root is 100%-height and would collapse in an auto row. */}
      <div
        className={classNames(
          "grid min-h-0",
          isReadOnly
            ? "grid-rows-[auto_minmax(0,1fr)]"
            : "grid-rows-[minmax(0,1fr)]"
        )}
      >
        {isReadOnly ? <ReadOnlyNotice /> : null}
        <Tabs.Root
          value={selectedTab}
          onValueChange={(selectedTab: any) => {
            useTabsStore.setState({ selectedTab });
          }}
          className={sandboxStyles.Tabs}
        >
          <div className="flex justify-start items-end gap-4">
            <EditorTabList />
            <Actions />
          </div>
          <WithGraph>
            <Tabs.Content
              value="Document"
              className={classNames(
                "bg-white dark:bg-black overflow-hidden relative grid h-full",
                isReadOnly
                  ? "grid-rows-[minmax(0,1fr)]"
                  : "grid-rows-[auto_minmax(0,1fr)]"
              )}
            >
              {isReadOnly ? null : <AiToolbar />}
              <TextEditor
                value={text}
                onChange={onChange}
                extendOptions={{
                  readOnly: !hasProAccess,
                }}
              />
            </Tabs.Content>
            <Tabs.Content value="Theme" className="overflow-hidden">
              <ThemeTab />
            </Tabs.Content>
            <LoadingState isLoading={isLoading} pending={pending()} />
            {isReadOnly ? null : (
              <ClearTextButton
                handleClear={() => {
                  useDoc.setState(
                    { text: "", meta: {} },
                    false,
                    "EditHosted/clear"
                  );
                  const editor = useEditorStore.getState().editor;
                  if (!editor) return;
                  editor.focus();
                }}
              />
            )}
            <EditorError />
          </WithGraph>
        </Tabs.Root>
      </div>
    </FlowchartLayout>
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
  await prepareChart({
    doc,
    details: {
      id: chart.id,
      title: chart.name,
      isHosted: true,
      isPublic: chart.is_public,
      publicId: chart.public_id ?? undefined,
    },
  });
  return doc;
}
