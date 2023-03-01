import { Trans } from "@lingui/macro";
import { OnMount } from "@monaco-editor/react";
import * as Tabs from "@radix-ui/react-tabs";
import { useEffect, useRef } from "react";
import { useQuery } from "react-query";
import { useParams, useRouteMatch } from "react-router-dom";

import { ClearTextButton } from "../components/ClearTextButton";
import EditorError from "../components/EditorError";
import { EditorOptions } from "../components/EditorOptions";
import { EditorWrapper } from "../components/EditorWrapper";
import { EditWrapper } from "../components/EditWrapper";
import Main from "../components/Main";
import { EditLayoutTab } from "../components/Tabs/EditLayoutTab";
import { EditMetaTab } from "../components/Tabs/EditMetaTab";
import { EditStyleTab } from "../components/Tabs/EditStyleTab";
import { TextEditor } from "../components/TextEditor";
import { setDocText } from "../lib/docHelpers";
import { useIsValidSponsor } from "../lib/hooks";
import { getHostedChart } from "../lib/queries";
import { cleanupYDoc, setupYDoc } from "../lib/realtime";
import { useDetailsStore } from "../lib/useDoc";
import { useTrackLastChart } from "../lib/useLastChart";
import editStyles from "./Edit.module.css";

export default function EditHosted() {
  const { id } = useParams<{ id: string }>();
  const { isSuccess } = useQuery(
    ["useHostedDoc", id],
    () => loadHostedDoc(id),
    {
      enabled: !!id,
      suspense: true,
      staleTime: 0,
      cacheTime: 0,
    }
  );

  useEffect(() => {
    return () => {
      // clear details
      useDetailsStore.setState({
        id: undefined,
        title: "",
        // intentionally leave isHosted in the same position
        isHosted: true,
        isPublic: false,
        publicId: undefined,
      });

      // clear y doc
      cleanupYDoc();
    };
  }, []);

  const editorRef = useRef<null | Parameters<OnMount>[0]>(null);

  const { url } = useRouteMatch();
  useTrackLastChart(url);
  const isValidSponsor = useIsValidSponsor();

  return (
    <EditWrapper>
      <Main>
        <EditorWrapper>
          <Tabs.Root defaultValue="Document" className={editStyles.Tabs}>
            <Tabs.List className={editStyles.TabsList}>
              <Tabs.Trigger value="Document">
                <Trans>Document</Trans>
              </Tabs.Trigger>
              <Tabs.Trigger value="Layout">
                <Trans>Layout</Trans>
              </Tabs.Trigger>
              <Tabs.Trigger value="Style">
                <Trans>Style</Trans>
              </Tabs.Trigger>
              {isValidSponsor && (
                <Tabs.Trigger value="Advanced">
                  <Trans>Advanced</Trans>
                </Tabs.Trigger>
              )}
            </Tabs.List>
            <Tabs.Content value="Document">
              <EditorOptions>
                <TextEditor editorRef={editorRef} bindToRealtime={isSuccess} />
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
            setDocText("", "EditHosted/clear");
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

async function loadHostedDoc(id: string) {
  // Make sure user has access by loading here
  const chart = await getHostedChart(id);
  if (!chart) throw new Error("Chart not found");

  // setup details
  useDetailsStore.setState({
    id: chart.id,
    title: chart.name,
    isHosted: true,
    isPublic: chart.is_public,
    publicId: chart.public_id,
  });

  setupYDoc("hosted", id);
}
