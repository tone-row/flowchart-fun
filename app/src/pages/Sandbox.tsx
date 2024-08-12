import * as Tabs from "@radix-ui/react-tabs";
import throttle from "lodash.throttle";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { ClearTextButton } from "../components/ClearTextButton";
import EditorError from "../components/EditorError";
import { Actions } from "../components/Actions";
import { FlowchartHeader } from "../components/FlowchartHeader";
import WithGraph from "../components/WithGraph";
import { EditorTabList } from "../components/Tabs/EditorTabList";

import { OnChange } from "@monaco-editor/react";

import { TextEditor } from "../components/TextEditor";
import { getDefaultLocalChart } from "../lib/getDefaultChart";
import { prepareChart } from "../lib/prepareChart/prepareChart";
import { Doc, docToString, useDoc } from "../lib/useDoc";
import { useTrackLastChart } from "../lib/useLastChart";
import styles from "./Sandbox.module.css";
import { useTabsStore } from "../lib/useTabsStore";
import { newDelimiters, SANDBOX_STORAGE_KEY } from "../lib/constants";
import { SandboxWarning } from "../components/SandboxWarning";
import { useSandboxWarning } from "../lib/useSandboxWarning";
import { LoadFromHashDialog } from "../components/LoadFromHashDialog";
import { ThemeTab } from "../components/Tabs/ThemeTab";
import { FlowchartLayout } from "../components/FlowchartLayout";
import { useEditorStore } from "../lib/useEditorStore";
import { getDefaultText } from "../lib/getDefaultText";
import { AiToolbar } from "../components/AiToolbar";

const SANDBOX_WARNING_TIME = 3 * 60 * 1000; // 3 minutes

const Sandbox = memo(function Edit() {
  // Wait 1 minute and trigger a sandbox modal overtop of the editor
  // if it's never been triggered before for this particular chart
  // and if the text isn't the default text
  const warningTimeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    // If it's already been displayed for this chart, bail
    if (useDoc.getState().meta?.hasSeenSandboxWarning) return;

    const showWarningAfterDelay = () => {
      const docText = useDoc.getState().text;
      const isDefaultText = docText === getDefaultText();

      // If it's the default text, reset the timeout
      if (isDefaultText) {
        if (warningTimeout.current) clearTimeout(warningTimeout.current);
        warningTimeout.current = setTimeout(
          showWarningAfterDelay,
          SANDBOX_WARNING_TIME
        );
        return;
      }

      const dialog = document.querySelector(".ff-dialog");
      if (dialog) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.removedNodes.length > 0) {
              setTimeout(() => {
                useSandboxWarning.setState({ isOpen: true });
              }, 1000);
              observer.disconnect();
            }
          });
        });
        observer.observe(dialog.parentNode!, {
          childList: true,
          attributeFilter: ["role"],
        });
      } else {
        useSandboxWarning.setState({ isOpen: true });
      }
    };

    // Show the warning after 1 minute
    warningTimeout.current = setTimeout(
      showWarningAfterDelay,
      SANDBOX_WARNING_TIME
    );

    return () => {
      if (warningTimeout.current) clearTimeout(warningTimeout.current);
    };
  }, []);

  const storeDoc = useMemo(() => {
    return throttle(
      (doc: Doc) => {
        const docString = docToString(doc);
        localStorage.setItem(SANDBOX_STORAGE_KEY, docString);
      },
      1000,
      { trailing: true }
    );
  }, []);

  useEffect(() => useDoc.subscribe(storeDoc), [storeDoc]);

  const onChange = useCallback<OnChange>(
    (value) =>
      useDoc.setState(
        (state) => ({
          text: value ?? "",
          details: {
            ...state.details,
            touched: true,
          },
        }),
        false,
        "Edit/text"
      ),
    []
  );

  const url = useLocation().pathname;
  useTrackLastChart(url);

  const text = useDoc((d) => d.text);
  const selectedTab = useTabsStore((s) => s.selectedTab);
  useEffect(() => {
    return () => {
      useTabsStore.setState({ selectedTab: "Document" });
    };
  }, []);

  return (
    <>
      <FlowchartLayout>
        <FlowchartHeader />
        <Tabs.Root
          value={selectedTab}
          className={styles.Tabs}
          onValueChange={(selectedTab: any) => {
            useTabsStore.setState({ selectedTab });
          }}
        >
          <div className="flex justify-between md:justify-start items-end gap-4">
            <EditorTabList />
            <Actions />
          </div>
          <WithGraph>
            <Tabs.Content
              value="Document"
              className="bg-white dark:bg-black overflow-hidden relative grid grid-rows-[auto_minmax(0,1fr)] h-full"
            >
              <AiToolbar />
              <TextEditor value={text} onChange={onChange} />
            </Tabs.Content>
            <Tabs.Content value="Theme" className="overflow-hidden">
              <ThemeTab />
            </Tabs.Content>
            <ClearTextButton
              handleClear={() => {
                useDoc.setState({ text: "", meta: {} }, false, "Edit/clear");
                const editor = useEditorStore.getState().editor;
                if (!editor) return;
                editor.focus();
              }}
            />
            <EditorError />
          </WithGraph>
        </Tabs.Root>
      </FlowchartLayout>
      <SandboxWarning />
      <LoadFromHashDialog />
    </>
  );
});

/**
 * This is a wrapper component that loads the workspace into our zustand store
 */
function EditOuter() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    loadWorkspace();
    setLoaded(true);
  }, []);
  if (!loaded) return null;
  return <Sandbox />;
}

export default EditOuter;

/**
 * Load the workspace into our zustand store
 */
async function loadWorkspace() {
  let workspaceText = localStorage.getItem(SANDBOX_STORAGE_KEY);

  // If nothing in storage, create a new chart
  if (!workspaceText) {
    workspaceText = getDefaultLocalChart();
  }

  // Check the expires time
  const isValid = getExpiresAt(workspaceText);
  if (!isValid) {
    workspaceText = getDefaultLocalChart();
  }

  // Prepare the chart
  await prepareChart({
    doc: workspaceText,
    details: {
      id: "",
      title: "",
      isHosted: false,
      touched: false,
    },
  });

  return workspaceText;
}

/**
 * Checks the expiry time in the metadata of the document
 *
 * Returns true if valid, and false if expired or anything else is wrong
 */
function getExpiresAt(documentStr: string) {
  const parts = documentStr.split(newDelimiters);
  const metaStr = parts[1];
  if (!metaStr) return false;
  try {
    const meta = JSON.parse(metaStr);
    if (!meta?.expires) return false;
    const expires = new Date(meta.expires);
    if (expires < new Date()) return false;
    return expires;
  } catch (e) {
    return false;
  }
}
