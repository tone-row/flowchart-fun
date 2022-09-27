import { t, Trans } from "@lingui/macro";
import { Check, LinkSimple } from "phosphor-react";
import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useMutation } from "react-query";

import { gaExportChart } from "../lib/analytics";
import { useTitle } from "../lib/hooks";
import { toMermaidJS } from "../lib/mermaid";
import { makeChartPublic, queryClient, useChart } from "../lib/queries";
import { useGraphStore } from "../lib/useGraphStore";
import { Box, Type } from "../slang";
import { AppContext } from "./AppContext";
import { Button, Dialog, Textarea } from "./Shared";
import styles from "./ShareDialog.module.css";
import Spinner from "./Spinner";

export default function ShareDialog() {
  const [_, isHosted, id] = useTitle();
  const { data: chart } = useChart(id);
  const { shareModal, setShareModal, shareLink } = useContext(AppContext);
  const close = useCallback(() => setShareModal(false), [setShareModal]);
  const fullscreen = `${new URL(window.location.href).origin}/f#${shareLink}`;
  const readOnly = `${new URL(window.location.href).origin}/c#${shareLink}`;
  const editable = `${new URL(window.location.href).origin}/n/${shareLink}`;
  const makePublic = useMutation(
    "makeChartPublic",
    async (isPublic: boolean) => {
      if (isHosted && id) {
        await makeChartPublic(id, isPublic);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["useChart", id]);
      },
    }
  );

  return (
    <Dialog
      dialogProps={{
        isOpen: shareModal,
        onDismiss: close,
        "aria-label": t`Export`,
      }}
      innerBoxProps={{
        gap: 6,
      }}
    >
      <Column>
        <Title>
          <Trans>Download</Trans>
        </Title>
        <Preview />
        <Box gap={2} flow="column" className={styles.DownloadButtons}>
          <Button
            onClick={() => {
              window.__FF_downloadSVG();
              gaExportChart({ action: "Download", label: "SVG" });
            }}
            aria-label="Download SVG"
            text="SVG"
          />
          <Button
            onClick={() => {
              window.__FF_downloadPNG();
              gaExportChart({ action: "Download", label: "PNG" });
            }}
            aria-label="Download PNG"
            text="PNG"
          />
          <Button
            onClick={() => {
              window.__FF_downloadJPG();
              gaExportChart({ action: "Download", label: "JPG" });
            }}
            aria-label="Download JPG"
            text="JPG"
          />
        </Box>
      </Column>
      {isHosted && (
        <Column>
          <Title>
            <Trans>Public</Trans>
          </Title>
          <Box
            flow="column"
            content="normal start"
            items="center stretch"
            gap={2}
          >
            <Type as="label" htmlFor="isPublic" size={-1}>
              <Trans>Make publicly accessible</Trans>
            </Type>
            <input
              type="checkbox"
              name="isPublic"
              id="isPublic"
              defaultChecked={chart?.is_public}
              onChange={(e) => {
                makePublic.mutate(e.target.checked);
              }}
            />
            {makePublic.isLoading && <Spinner />}
          </Box>
          {chart?.is_public && (
            <Box>
              <LinkCopy
                value={`${window.location.origin}/p/${chart.public_id}`}
                title={t`Public`}
                rawTitle="Public"
              />
            </Box>
          )}
        </Column>
      )}

      <Column>
        <Title>
          <Trans>Link</Trans>
        </Title>
        <Box gap={4}>
          <LinkCopy
            value={fullscreen}
            title={t`Fullscreen`}
            rawTitle="Fullscreen"
          />
          <LinkCopy value={editable} title={t`Editable`} rawTitle="Editable" />
          <LinkCopy
            value={readOnly}
            title={t`Read-only`}
            rawTitle="Read-only"
          />
        </Box>
      </Column>
      <Column>
        <Title>
          <Trans>Export</Trans>
        </Title>
        <Mermaid />
      </Column>
    </Dialog>
  );
}

function Title({ children }: { children: ReactNode }) {
  return (
    <Type weight="700" size={1}>
      {children}
    </Type>
  );
}

function Column({ children }: { children: ReactNode }) {
  return (
    <Box className={styles.Column} gap={1} content="start normal">
      {children}
    </Box>
  );
}

function LinkCopy({
  value,
  title,
  rawTitle,
}: {
  value: string;
  title: string;
  rawTitle: string;
}) {
  const [copied, setCopied] = useState(false);
  const Icon = copied ? Check : LinkSimple;
  useEffect(() => {
    if (copied) setTimeout(() => setCopied(false), 3000);
  }, [copied]);

  async function copyText() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    gaExportChart({ action: "Copy Link", label: rawTitle });
  }
  return (
    <Box gap={2}>
      <Type size={-1}>{title}</Type>
      <Box
        template="auto / auto 1fr auto"
        items="stretch normal"
        className={styles.LinkCopy}
        rad={1}
        gap={1}
      >
        <Box
          content="center"
          className={styles.LinkCopyLeft}
          self="stretch normal"
          background={copied ? "palette-green-2" : undefined}
          rad={2}
          p={1}
        >
          <Icon
            width={15}
            height={15}
            data-testid={copied ? `Copied ${rawTitle}` : ""}
            color={copied ? "white" : "black"}
          />
        </Box>
        <Type
          size={-2}
          as="input"
          type="text"
          value={value}
          readOnly
          pl={2}
          className={styles.LinkCopyInput}
          onFocus={copyText}
        />
        <Box>
          <Button
            onClick={copyText}
            className={styles.LinkCopyButton}
            text={t`Copy`}
            aria-label={`${t`Copy`} ${title}`}
            py={2}
          />
        </Box>
      </Box>
    </Box>
  );
}

function Preview() {
  const [__html, set] = useReducer((_: string, x: string) => x, "");
  const [bg, setBG] = useReducer((_: string, x: string) => x, "");
  useEffect(() => {
    // defer
    setTimeout(() => setBG(window.__FF_getGraphThemeBG()), 0);
    setTimeout(() => {
      (async () => {
        const svg = await window.__FF_getSVG();
        set(svg);
      })();
    }, 0);
  }, []);
  if (!__html) return <>...</>;
  return (
    <Box
      className={styles.Preview}
      dangerouslySetInnerHTML={{ __html }}
      p={2}
      rad={1}
      style={{ "--bg": bg }}
    />
  );
}

function useMermaidJS() {
  const layout = useGraphStore((store) => store.layout);
  const elements = useGraphStore((store) => store.elements);
  return toMermaidJS({ layout, elements });
}

function Mermaid() {
  const [copied, setCopied] = useState(false);
  const mermaid = useMermaidJS();
  return (
    <>
      <Type size={-1}>Mermaid.JS</Type>
      <Textarea
        value={mermaid}
        readOnly
        disabled
        className={styles.CustomTextarea}
        box={{ p: 1 }}
        size={-2}
        rows={Math.min(mermaid.split("\n").length, 20)}
      />
      <Box flow="column" items="center" content="start" gap={2}>
        <Button
          self="normal start"
          onClick={() => {
            (async () => {
              await navigator.clipboard.writeText(mermaid);
              setCopied(true);
              gaExportChart({ action: "Copy Link", label: "Mermaid" });
            })();
          }}
          className={styles.LinkCopyButton}
          text={t`Copy`}
          aria-label="Copy Mermaid Code"
          py={2}
        />
        {copied && <Check data-testid="Copied Mermaid Code" />}
      </Box>
    </>
  );
}
