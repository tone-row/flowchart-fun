import { t, Trans } from "@lingui/macro";
import produce from "immer";
import { compressToEncodedURIComponent } from "lz-string";
import { Check, LinkSimple } from "phosphor-react";
import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useMutation } from "react-query";

import { toMermaidJS } from "../lib/mermaid";
import { makeChartPublic } from "../lib/queries";
import { docToString, useDoc, useDocDetails } from "../lib/useDoc";
import { useGraphStore } from "../lib/useGraphStore";
import { Box, Type } from "../slang";
import { AppContext } from "./AppContext";
import { Button, Dialog, Textarea } from "./Shared";
import styles from "./ShareDialog.module.css";
import Spinner from "./Spinner";

export default function ShareDialog() {
  const isHosted = useDocDetails("isHosted");
  const { shareModal, setShareModal } = useContext(AppContext);
  const close = useCallback(() => setShareModal(false), [setShareModal]);
  const docString = useDoc(docToString);
  const shareLink = useMemo(() => {
    return compressToEncodedURIComponent(docString);
  }, [docString]);
  const fullscreen = `${new URL(window.location.href).origin}/f#${shareLink}`;
  const readOnly = `${new URL(window.location.href).origin}/c#${shareLink}`;
  const editable = `${new URL(window.location.href).origin}/n#${shareLink}`;

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
            }}
            aria-label="Download SVG"
            text="SVG"
          />
          <Button
            onClick={() => {
              window.__FF_downloadPNG();
            }}
            aria-label="Download PNG"
            text="PNG"
          />
          <Button
            onClick={() => {
              window.__FF_downloadJPG();
            }}
            aria-label="Download JPG"
            text="JPG"
          />
        </Box>
      </Column>
      {isHosted ? <HostedOptions /> : null}
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
  ariaLabel = "",
}: {
  value: string;
  title: string;
  rawTitle: string;
  ariaLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const Icon = copied ? Check : LinkSimple;
  useEffect(() => {
    if (copied) setTimeout(() => setCopied(false), 3000);
  }, [copied]);

  async function copyText() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
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
          aria-label={ariaLabel}
          size={-2}
          as="input"
          type="text"
          value={value}
          readOnly
          pl={2}
          className={styles.LinkCopyInput}
          onFocus={copyText}
          data-testid={`Copy ${rawTitle}`}
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

function getMermaidText() {
  const { layout, elements } = useGraphStore.getState();
  return toMermaidJS({ layout, elements });
}

function Mermaid() {
  const [copied, setCopied] = useState(false);
  const mermaid = useMemo(() => getMermaidText(), []);
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

function HostedOptions() {
  const id = useDocDetails("id");
  if (typeof id !== "number") throw new Error("id is not a number");

  const isPublic = useDocDetails("isPublic");
  const publicId = useDocDetails("publicId");

  const makePublic = useMutation(
    "makeChartPublic",
    async (isPublic: boolean) => makeChartPublic(id, isPublic),
    {
      onSuccess: (result) => {
        if (!result) return;
        useDoc.setState((state) => {
          return produce(state, (draft) => {
            draft.details.isPublic = result.isPublic;
            draft.details.publicId = result.publicId;
          });
        });
      },
    }
  );
  return (
    <Column>
      <Title>
        <Trans>Public</Trans>
      </Title>
      <Box flow="column" content="normal start" items="center stretch" gap={2}>
        <Type as="label" htmlFor="isPublic" size={-1}>
          <Trans>Make publicly accessible</Trans>
        </Type>
        <input
          type="checkbox"
          name="isPublic"
          id="isPublic"
          defaultChecked={isPublic}
          onChange={(e) => {
            makePublic.mutate(e.target.checked);
          }}
        />
        {makePublic.isLoading && (
          <Spinner r={6} s={2} c="var(--palette-purple-0)" />
        )}
      </Box>
      {isPublic && (
        <Box>
          <LinkCopy
            value={`${window.location.origin}/p/${publicId}`}
            title={t`Public`}
            rawTitle="Public"
            ariaLabel="Copy Public Link"
          />
        </Box>
      )}
    </Column>
  );
}
