import { Trans } from "@lingui/macro";
import { OnMount } from "@monaco-editor/react";
import * as Tabs from "@radix-ui/react-tabs";
import { Check, DotsThree } from "phosphor-react";
import { useRef } from "react";
import { useQuery } from "react-query";
import { useParams, useRouteMatch } from "react-router-dom";

import { ClearTextButton } from "../components/ClearTextButton";
import EditorError from "../components/EditorError";
import { EditorOptions } from "../components/EditorOptions";
import { EditorWrapper } from "../components/EditorWrapper";
import { EditWrapper } from "../components/EditWrapper";
import Main from "../components/Main";
import Spinner from "../components/Spinner";
import { EditLayoutTab } from "../components/Tabs/EditLayoutTab";
import { EditMetaTab } from "../components/Tabs/EditMetaTab";
import { EditStyleTab } from "../components/Tabs/EditStyleTab";
import { TextEditor } from "../components/TextEditor";
import { setDocText, useDocText } from "../lib/docHelpers";
import { useIsValidSponsor } from "../lib/hooks";
import { prepareChart } from "../lib/prepareChart/prepareChart";
import { getHostedChart } from "../lib/queries";
import { setupYDoc } from "../lib/realtime";
import { useDetailsStore } from "../lib/useDoc";
import { useTrackLastChart } from "../lib/useLastChart";
import editStyles from "./Edit.module.css";
import styles from "./EditHosted.module.css";

export default function EditHosted() {
  const { id } = useParams<{ id: string }>();
  const { isSuccess } = useQuery(
    ["useHostedDoc", id],
    () => loadHostedDoc(id),
    {
      enabled: !!id,
      suspense: true,
      staleTime: 0,
    }
  );

  const text = useDocText();
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
                <TextEditor
                  editorRef={editorRef}
                  value={text}
                  bindToRealtime={isSuccess}
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
        <LoadingState isLoading={false} pending={false} />
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
  // setup y doc asap
  setupYDoc("hosted", id);

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
}
