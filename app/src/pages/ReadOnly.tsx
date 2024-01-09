import { decompressFromEncodedURIComponent } from "lz-string";
import { useQuery } from "react-query";
import { useLocation, useParams } from "react-router-dom";
import styles from "./Sandbox.module.css";
import * as Tabs from "@radix-ui/react-tabs";

import EditorError from "../components/EditorError";
import { FlowchartHeader } from "../components/FlowchartHeader";
import { WithMobileTabToggle } from "../components/WithMobileTabToggle";
import WithGraph from "../components/WithGraph";
import { TextEditor } from "../components/TextEditor";
import { prepareChart } from "../lib/prepareChart/prepareChart";
import { useDoc } from "../lib/useDoc";
import { FlowchartLayout } from "../components/FlowchartLayout";
import { useTabsStore } from "../lib/useTabsStore";
import { useEffect } from "react";
import { EditorTabList } from "../components/Tabs/EditorTabList";

function ReadOnly() {
  const { pathname } = useLocation();
  const { graphText = window.location.hash.slice(1) } = useParams<{
    graphText: string;
  }>();
  useQuery(
    ["read", pathname, graphText],
    () => loadReadOnly(pathname, graphText),
    {
      enabled: typeof graphText === "string",
      suspense: true,
      staleTime: 0,
    }
  );

  const text = useDoc((d) => d.text);
  const selectedTab = useTabsStore((s) => s.selectedTab);
  useEffect(() => {
    return () => {
      useTabsStore.setState({ selectedTab: "Document" });
    };
  }, []);

  return (
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
        </div>
        <WithGraph>
          <Tabs.Content value="Document" className="overflow-hidden">
            <TextEditor
              value={text}
              extendOptions={{
                readOnly: true,
              }}
            />
          </Tabs.Content>
        </WithGraph>
      </Tabs.Root>
    </FlowchartLayout>
  );
}

export default ReadOnly;

async function loadReadOnly(path: string, graphText: string) {
  const initialText = isCompressed(path)
    ? decompressFromEncodedURIComponent(graphText) ?? ""
    : decodeURIComponent(graphText);
  await prepareChart({
    doc: initialText,
    details: {
      isHosted: false,
      id: "read",
      title: "read-only-flowchart",
    },
  });
  return initialText;
}

function isCompressed(pathname: string) {
  return ["/c", "/f", "/n", "/new"].some((p) => pathname === p);
}
