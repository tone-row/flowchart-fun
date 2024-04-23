import { t, Trans } from "@lingui/macro";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { saveAs } from "file-saver";
import { parse, toMermaid } from "graph-selector";
import produce from "immer";
import { compressToEncodedURIComponent } from "lz-string";
import {
  ArrowSquareOut,
  Check,
  DownloadSimple,
  LinkSimple,
} from "phosphor-react";
import { ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "react-query";

import { AUTH_IMG_SCALE, UNAUTH_IMG_SCALE } from "../lib/constants";
import { useDownloadFilename, useIsProUser } from "../lib/hooks";
import { makeChartPublic } from "../lib/queries";
import { toVisioFlowchart, toVisioOrgChart } from "../lib/toVisio";
import { docToString, useDoc, useDocDetails } from "../lib/useDoc";
import { Box } from "../slang";
import { Close, Content, Overlay } from "../ui/Dialog";
import { Button2, Textarea } from "../ui/Shared";
import { Description, SectionTitle } from "../ui/Typography";
import { AppContext } from "./AppContextProvider";
import { downloadCanvas, downloadSvg, getCanvas, getSvg } from "./downloads";
import Loading from "./Loading";
import styles from "./ShareDialog.module.css";
import Spinner from "./Spinner";
import { SvgProOnlyPopover } from "./SvgProOnlyPopover";
import { toExcalidraw } from "../lib/toExcalidraw";
import { Link } from "react-router-dom";
import { toJSONCanvas } from "../lib/toJSONCanvas";
import { slugify } from "../lib/helpers";

export default function ShareDialog({ children }: { children?: ReactNode }) {
  const isHosted = useDocDetails("isHosted");
  const { shareModal, setShareModal } = useContext(AppContext);
  const docString = useDoc(docToString);
  const shareLink = useMemo(() => {
    return compressToEncodedURIComponent(docString);
  }, [docString]);
  const fullscreen = `${new URL(window.location.href).origin}/f#${shareLink}`;
  const readOnly = `${new URL(window.location.href).origin}/c#${shareLink}`;
  const editable = `${new URL(window.location.href).origin}/#load:${shareLink}`;
  const filename = useDownloadFilename();
  const isProUser = useIsProUser();
  const watermark = !isProUser;
  const scale = isProUser ? AUTH_IMG_SCALE : UNAUTH_IMG_SCALE;

  return (
    <Dialog.Root
      open={shareModal}
      onOpenChange={setShareModal}
      aria-label={t`Export`}
    >
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Overlay />
      <Content
        maxWidthClass="max-w-[600px] w-full"
        overflowV
        data-location="Share Dialog"
      >
        <Close />
        <Column>
          <PreviewImage watermark={watermark} scale={scale} />
          <SectionTitle className="mb-1">
            <Trans>Download</Trans>
          </SectionTitle>
          <div className="grid gap-2 grid-cols-3">
            <Button2
              aria-label="Download PNG"
              data-session-activity="Download PNG"
              onClick={() => {
                if (!window.__cy) return;
                getCanvas({
                  cy: window.__cy,
                  type: "png",
                  watermark,
                  scale,
                })
                  .then((canvas) =>
                    downloadCanvas({
                      ...canvas,
                      filename,
                    })
                  )
                  .catch(console.error);
              }}
            >
              PNG
            </Button2>
            <Button2
              aria-label="Download JPG"
              data-session-activity="Download JPG"
              onClick={() => {
                if (!window.__cy) return;
                getCanvas({
                  cy: window.__cy,
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
            >
              JPG
            </Button2>
            <SvgProOnlyPopover>
              <Button2
                disabled={!isProUser}
                aria-label="Download SVG"
                data-session-activity="Download SVG"
                onClick={async () => {
                  if (!window.__cy) return;
                  const svg = await getSvg({
                    cy: window.__cy,
                  });
                  downloadSvg({
                    svg,
                    filename,
                  });
                }}
              >
                SVG
              </Button2>
            </SvgProOnlyPopover>
          </div>
        </Column>
        {isHosted ? <HostedOptions /> : null}
        {isProUser && (
          <Column>
            <SectionTitle className="mb-1">
              <Trans>Link</Trans>
            </SectionTitle>
            <Box gap={4}>
              <LinkCopy
                value={fullscreen}
                title={t`Fullscreen`}
                rawTitle="Fullscreen"
              />
              <LinkCopy
                value={editable}
                title={t`Editable`}
                rawTitle="Editable"
              />
              <LinkCopy
                value={readOnly}
                title={t`Read-only`}
                rawTitle="Read-only"
              />
            </Box>
          </Column>
        )}
        <Column>
          <Title>
            <Trans>Export</Trans>
          </Title>
          <Tabs.Root className="grid gap-2" defaultValue="mermaid">
            <Tabs.List className="flex gap-2 items-center">
              <Tabs.Trigger
                value="mermaid"
                className="font-bold text-sm p-2 rounded data-[state=active]:bg-neutral-300 hover:bg-neutral-100 dark:data-[state=active]:bg-neutral-700 dark:hover:bg-neutral-800"
              >
                <span>Mermaid</span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="visio"
                className="font-bold text-sm p-2 rounded data-[state=active]:bg-neutral-300 hover:bg-neutral-100 dark:data-[state=active]:bg-neutral-700 dark:hover:bg-neutral-800"
              >
                <span>Visio</span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="excalidraw"
                className="font-bold text-sm p-2 rounded data-[state=active]:bg-neutral-300 hover:bg-neutral-100 dark:data-[state=active]:bg-neutral-700 dark:hover:bg-neutral-800"
              >
                <span>Excalidraw</span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="json"
                className="font-bold text-sm p-2 rounded data-[state=active]:bg-neutral-300 hover:bg-neutral-100 dark:data-[state=active]:bg-neutral-700 dark:hover:bg-neutral-800"
              >
                <span>JSON Canvas / Obsidian</span>
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="mermaid">
              <Mermaid />
            </Tabs.Content>
            <Tabs.Content value="visio">
              <VisioCSVDownload />
            </Tabs.Content>
            <Tabs.Content value="excalidraw">
              <Excalidraw />
            </Tabs.Content>
            <Tabs.Content value="json">
              <JSONCanvasShare />
            </Tabs.Content>
          </Tabs.Root>
        </Column>
      </Content>
    </Dialog.Root>
  );
}

function Title({ children }: { children: ReactNode }) {
  return <h3 className="text-lg font-bold mb-2">{children}</h3>;
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
      <Description size="xs">{title}</Description>
      <Box
        template="auto / auto 1fr auto"
        items="stretch normal"
        className={styles.LinkCopy}
        rad={1}
        gap={1}
      >
        <div
          className={`grid place-items-center rounded w-8 ${
            copied ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-700"
          }`}
        >
          <Icon
            width={15}
            height={15}
            data-testid={copied ? `Copied ${rawTitle}` : ""}
            color={copied ? "white" : "black"}
          />
        </div>
        <input
          aria-label={ariaLabel}
          type="text"
          value={value}
          readOnly
          className={`text-[12px] px-2 font-mono text-neutral-500 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700 rounded overflow-hidden bg-transparent`}
          onFocus={copyText}
          data-testid={`Copy ${rawTitle}`}
        />
        <Button2
          onClick={copyText}
          aria-label={`${t`Copy`} ${title}`}
          data-session-activity={`Copy ${title}`}
        >
          <Trans>Copy</Trans>
        </Button2>
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
  const img = useQuery(
    ["previewImg"],
    async () => {
      if (!window.__cy) return "";
      const { canvas } = await getCanvas({
        type: "png",
        cy: window.__cy,
        watermark,
        scale,
      });
      return canvas.toDataURL();
    },
    {
      cacheTime: 0,
      staleTime: 0,
      refetchOnMount: true,
    }
  );

  if (img.isLoading) return <Loading />;
  return (
    <div className="m-4 max-h-[400px] relative text-center">
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
    <div className="grid gap-2">
      <p className="text-sm text-neutral-500">
        <Trans>
          Copy your mermaid.js code or open it directly in the mermaid.js live
          editor.
        </Trans>
      </p>
      <div className="relative">
        <Textarea
          value={code}
          readOnly
          disabled
          className={`${styles.CustomTextarea} text-xs`}
          box={{ p: 1 }}
          rows={Math.min(code.split("\n").length, 20)}
        />
        <div className="flex items-center gap-1 absolute bottom-1 right-1">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 self-end text-sm font-bold flex items-center gap-1 mr-2 mb-[1px]"
            data-testid="Mermaid Live"
            data-session-activity="Mermaid Live"
          >
            <ArrowSquareOut width={15} height={15} />
            <span>mermaid.live</span>
          </a>
          <Button2
            data-session-activity="Copy Mermaid Code"
            onClick={() => {
              (async () => {
                await navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
              })();
            }}
            aria-label="Copy Mermaid Code"
          >
            <Trans>Copy</Trans>
          </Button2>
          {copied && <Check data-testid="Copied Mermaid Code" />}
        </div>
      </div>
    </div>
  );
}

function Excalidraw() {
  const [copied, setCopied] = useState(false);
  // set copied back to false after 3 seconds
  useEffect(() => {
    if (copied) setTimeout(() => setCopied(false), 3000);
  }, [copied]);
  return (
    <div className="grid gap-2">
      <img
        src="/images/export-to-excalidraw.gif"
        alt="Excalidraw"
        className="rounded w-full h-auto mb-3"
      />
      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-normal">
        <Trans>
          Copy your Excalidraw code and paste it into{" "}
          <a
            href="https://excalidraw.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 dark:text-blue-300"
          >
            excalidraw.com
          </a>{" "}
          to edit. This feature is experimental and may not work with all
          diagrams. If you find a bug, please{" "}
          <Link to="/o" className="text-blue-500 dark:text-blue-300">
            let us know
          </Link>
          .
        </Trans>
      </p>
      <Button2
        color="blue"
        data-session-activity="Copy Excalidraw"
        onClick={() => {
          navigator.clipboard.writeText(toExcalidraw());
          setCopied(true);
        }}
        rightIcon={copied ? <Check weight="bold" /> : null}
      >
        Copy to Excalidraw
      </Button2>
    </div>
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
              if (result.publicId) draft.details.publicId = result.publicId;
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
        <label htmlFor="isPublic" className="text-sm">
          <Trans>Make publicly accessible</Trans>
        </label>
        <input
          type="checkbox"
          name="isPublic"
          id="isPublic"
          defaultChecked={isPublic}
          data-session-activity="Toggle Make Public"
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

function VisioCSVDownload() {
  const filename = useDownloadFilename();
  return (
    <div className="grid gap-2">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        <Trans>
          Import your diagram it into Microsoft Visio using one of these CSV
          files.
        </Trans>
      </p>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        <Trans>Check out the guide:</Trans>{" "}
        <a
          href="https://flowchart.fun/blog/post/export-to-microsoft-visio"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 dark:text-blue-300 font-bold"
        >
          How to Export Your Flowchart Fun Diagrams to Visio
        </a>
      </p>
      <div className="grid md:grid-cols-[repeat(2,minmax(0,300px))] gap-1 md:gap-2">
        <VisioDownloadOption
          imgSrc="/images/visio-flowchart.svg"
          title={t`Basic Flowchart`}
          rawTitle="Basic Flowchart"
          handleDownload={async () => {
            const csv = await toVisioFlowchart(parse(useDoc.getState().text));
            const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
            const blob = new Blob([bom, csv], { type: "text/csv" });
            saveAs(blob, `${filename}-visio-flow.csv`);
          }}
          testId="Visio Flowchart"
        >
          <Trans>Use this file for sequences, processes, and workflows.</Trans>
        </VisioDownloadOption>
        <VisioDownloadOption
          imgSrc="/images/visio-orgchart.svg"
          title={t`Organization Chart`}
          rawTitle="Organization Chart"
          handleDownload={async () => {
            const csv = await toVisioOrgChart(parse(useDoc.getState().text));
            const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
            const blob = new Blob([bom, csv], { type: "text/csv" });
            saveAs(blob, `${filename}-visio-org.csv`);
          }}
          testId="Visio Org Chart"
        >
          <Trans>
            Use this file for org charts, hierarchies, and other organizational
            structures.
          </Trans>
          <TipChip />
          <Trans>
            Include a title using a <InlineCode>title</InlineCode> attribute. To
            use Visio coloring, add a <InlineCode>roleType</InlineCode>{" "}
            attribute equal to one of the following:
          </Trans>{" "}
          <span>
            Executive, Manager, Position, Assistant, Staff, Consultant, Vacancy
          </span>
        </VisioDownloadOption>
      </div>
    </div>
  );
}

function VisioDownloadOption({
  title,
  rawTitle,
  children,
  imgSrc,
  handleDownload,
  testId,
}: {
  title: string;
  rawTitle: string;
  children: ReactNode;
  imgSrc: string;
  handleDownload: () => Promise<void>;
  testId: string;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="grid md:grid-rows-[auto_auto_160px_auto] gap-3 rounded-lg bg-neutral-100 p-2 justify-items-center border-neutral-300 border dark:border-neutral-700 dark:bg-neutral-800">
      <img src={imgSrc} alt={title} className="rounded w-full h-auto mb-3" />
      <h2 className="text font-bold">{title}</h2>
      <div className="text-xs text-neutral-500 dark:text-neutral-400">
        {children}
      </div>
      <Button2
        data-testid={testId}
        color="blue"
        className="w-full"
        data-session-activity={`Download Visio ${rawTitle}`}
        onClick={() => {
          setLoading(true);
          handleDownload().finally(() =>
            setTimeout(() => setLoading(false), 1000)
          );
        }}
        isLoading={loading}
        leftIcon={<DownloadSimple size={16} />}
      >
        {t`Download`} CSV
      </Button2>
    </div>
  );
}

function TipChip() {
  return (
    <span className="text-neutral-800 ml-2 mr-1 align-middle font-bold dark:text-neutral-200">
      <Trans>Tip</Trans>:
    </span>
  );
}

function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="bg-neutral-300 rounded p-1 text-[10px] font-mono text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200">
      {children}
    </code>
  );
}

function JSONCanvasShare() {
  const title = useDocDetails("title", "flowchart.fun");

  return (
    <div className="grid gap-2">
      <p className="leading-normal">
        <Trans>
          JSON Canvas is a JSON representation of your diagram used by{" "}
          <a
            href="https://obsidian.md/"
            target="_blank"
            className="text-blue-500 dark:text-blue-300 font-bold"
          >
            Obsidian
          </a>{" "}
          Canvas and other applications.
        </Trans>
      </p>
      <Button2
        color="blue"
        data-session-activity="Download JSON Canvas"
        onClick={() => {
          if (!window.__cy) return;
          const jsonCanvas = toJSONCanvas(window.__cy);
          const blob = new Blob([JSON.stringify(jsonCanvas, null, 2)], {
            type: "text/plain;charset=utf-8",
          });
          saveAs(blob, `${slugify(title)}.canvas`);
        }}
        className="w-full text-left text-neutral-500 dark:text-neutral-400 p-2 rounded border border-neutral-300 dark:border-neutral-700"
        aria-label="Copy JSON Canvas"
        leftIcon={<DownloadSimple size={16} />}
      >
        Download JSON Canvas
      </Button2>
    </div>
  );
}
