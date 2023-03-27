import { t, Trans } from "@lingui/macro";
import { Edge, Graph, Node, parse, toMermaid } from "graph-selector";
import produce from "immer";
import { compressToEncodedURIComponent } from "lz-string";
import { ArrowSquareOut, Check, LinkSimple } from "phosphor-react";
import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMutation, useQuery } from "react-query";

import { AUTH_IMG_SCALE, UNAUTH_IMG_SCALE } from "../lib/constants";
import { useTheme } from "../lib/graphThemes";
import { useDownloadFilename, useIsValidSponsor } from "../lib/hooks";
import { toMermaidJS } from "../lib/mermaid";
import { makeChartPublic } from "../lib/queries";
import { docToString, useDoc, useDocDetails } from "../lib/useDoc";
import { useGraphStore } from "../lib/useGraphStore";
import { Box, Type } from "../slang";
import { AppContext } from "./AppContext";
import { downloadCanvas, downloadSvg, getCanvas, getSvg } from "./downloads";
import Loading from "./Loading";
import { Button, Dialog, Textarea } from "./Shared";
import styles from "./ShareDialog.module.css";
import Spinner from "./Spinner";
import { SvgProOnlyPopover } from "./SvgProOnlyPopover";

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
  const theme = useTheme();
  const filename = useDownloadFilename();

  const isValidSponsor = useIsValidSponsor();
  const watermark = !isValidSponsor;
  const scale = isValidSponsor ? AUTH_IMG_SCALE : UNAUTH_IMG_SCALE;

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
        <PreviewImage watermark={watermark} scale={scale} />
        <Title>
          <Trans>Download</Trans>
        </Title>
        <Box gap={2} flow="column" className={styles.DownloadButtons}>
          <Button
            onClick={() => {
              if (!theme || !window.__cy) return;
              getCanvas({
                cy: window.__cy,
                theme,
                type: "png",
                watermark,
                scale,
              }).then((canvas) =>
                downloadCanvas({
                  ...canvas,
                  filename,
                })
              );
            }}
            aria-label="Download PNG"
            text="PNG"
          />
          <Button
            onClick={() => {
              if (!theme || !window.__cy) return;
              getCanvas({
                cy: window.__cy,
                theme,
                type: "jpg",
                watermark,
                scale,
              }).then((canvas) =>
                downloadCanvas({
                  ...canvas,
                  filename,
                })
              );
            }}
            aria-label="Download JPG"
            text="JPG"
          />
          <SvgProOnlyPopover>
            <Button
              disabled={!isValidSponsor}
              onClick={async () => {
                if (!theme || !window.__cy) return;
                const svg = await getSvg({
                  theme,
                  cy: window.__cy,
                });
                downloadSvg({
                  svg,
                  filename,
                });
              }}
              aria-label="Download SVG"
              text="SVG"
            />
          </SvgProOnlyPopover>
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
  rawTitle: "Fullscreen" | "Editable" | "Read-only" | "Public";
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

function PreviewImage({
  watermark,
  scale,
}: {
  watermark?: boolean;
  scale?: number;
}) {
  const theme = useTheme();
  const img = useQuery(
    ["previewImg"],
    async () => {
      if (!theme || !window.__cy) return "";
      const { canvas } = await getCanvas({
        type: "png",
        cy: window.__cy,
        theme,
        watermark,
        scale,
      });
      return canvas.toDataURL();
    },
    {
      enabled: !!theme,
      cacheTime: 0,
      staleTime: 0,
      refetchOnMount: true,
    }
  );

  if (img.isLoading) return <Loading />;
  return (
    <div className="p-4 max-h-[400px] relative text-center">
      <img
        src={img.data}
        alt="Preview"
        className="shadow-lg rounded inline-block h-full"
      />
    </div>
  );
}

function getMermaidText() {
  return toMermaid(parse(useDoc.getState().text));
}

function Mermaid() {
  const [copied, setCopied] = useState(false);
  const code = useMemo(() => getMermaidText(), []);
  const [link, setLink] = useState("#");
  useEffect(() => {
    getMermaidLiveLink();

    async function getMermaidLiveLink() {
      const state = {
        code,
        mermaid: '{\n  "theme": "default"\n}',
        autoSync: true,
        updateDiagram: true,
        editorMode: "code",
      };
      const deflate = await import("pako").then((m) => m.deflate);
      const fromUint8Array = await import("js-base64").then(
        (m) => m.fromUint8Array
      );
      const data = new TextEncoder().encode(JSON.stringify(state));
      const compressed = deflate(data, { level: 9 });
      const base = `https://mermaid.live/edit#pako:`;
      setLink(base + fromUint8Array(compressed, true));
    }
  }, [code]);
  return (
    <>
      <h2>Mermaid</h2>
      <div className="relative">
        <Textarea
          value={code}
          readOnly
          disabled
          className={styles.CustomTextarea}
          box={{ p: 1 }}
          size={-2}
          rows={Math.min(code.split("\n").length, 20)}
        />
        <div className="flex items-center gap-1 absolute bottom-1 right-1">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 self-end text-sm font-bold flex items-center gap-1 mr-2 mb-[1px]"
            data-testid="Mermaid Live"
          >
            <ArrowSquareOut width={15} height={15} />
            <span>mermaid.live</span>
          </a>
          <Button
            self="normal start"
            onClick={() => {
              (async () => {
                await navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
              })();
            }}
            className={styles.LinkCopyButton}
            text={t`Copy`}
            aria-label="Copy Mermaid Code"
            py={2}
          />
          {copied && <Check data-testid="Copied Mermaid Code" />}
        </div>
      </div>
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
        useDoc.setState(
          (state) => {
            return produce(state, (draft) => {
              draft.details.isPublic = result.isPublic;
              draft.details.publicId = result.publicId;
            });
          },
          false,
          "HostedOptions/makePublic"
        );
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
