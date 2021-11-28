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
import { makeChartPublic, queryClient, useChart } from "../lib/queries";
import { Box, Type } from "../slang";
import { AppContext } from "./AppContext";
import { Button, Dialog } from "./Shared";
import styles from "./ShareDialog.module.css";
import Spinner from "./Spinner";

export default function ShareDialog() {
  const [_, isHosted, id] = useTitle();
  const { data: chart } = useChart(id);
  const { shareModal, setShareModal, shareLink } = useContext(AppContext);
  const close = useCallback(() => setShareModal(false), [setShareModal]);
  const fullscreen = `${new URL(window.location.href).origin}/f#${shareLink}`;
  const withEditor = `${new URL(window.location.href).origin}/c#${shareLink}`;
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
        at: {
          tablet: {
            template: "auto / repeat(auto-fill, minmax(200px, 1fr))",
            gap: 10,
          },
        },
      }}
    >
      <Column>
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
        <Title>
          <Trans>Download</Trans>
        </Title>
        <Box gap={2} flow="column" className={styles.DownloadButtons}>
          <Button
            onClick={() => {
              window.flowchartFunDownloadSVG();
              gaExportChart({ action: "Download", label: "SVG" });
            }}
            aria-label="SVG"
            text="SVG"
          />
          <Button
            onClick={() => {
              window.flowchartFunDownloadPNG();
              gaExportChart({ action: "Download", label: "PNG" });
            }}
            aria-label="PNG"
            text="PNG"
          />
          <Button
            onClick={() => {
              window.flowchartFunDownloadJPG();
              gaExportChart({ action: "Download", label: "JPG" });
            }}
            aria-label="JPG"
            text="JPG"
          />
        </Box>
      </Column>
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
          <LinkCopy
            value={withEditor}
            title={t`With Editor`}
            rawTitle="With Editor"
          />
        </Box>
      </Column>
      <Column>
        <Title>
          <Trans>Preview</Trans>
        </Title>
        <Preview />
      </Column>
    </Dialog>
  );
}

function Title({ children }: { children: ReactNode }) {
  return <Type>{children}</Type>;
}

function Column({ children }: { children: ReactNode }) {
  return (
    <Box
      className={styles.Column}
      gap={2}
      at={{ tablet: { gap: 4 } }}
      content="start normal"
    >
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
        >
          <Icon width={15} height={15} />
        </Box>
        <Type
          size={-2}
          as="input"
          type="text"
          value={value.slice(0, 40)}
          readOnly
          pl={2}
          className={styles.LinkCopyInput}
        />
        <Box>
          <Button
            onClick={() => {
              (async () => {
                await navigator.clipboard.writeText(value);
                setCopied(true);
                gaExportChart({ action: "Copy Link", label: rawTitle });
              })();
            }}
            className={styles.LinkCopyButton}
            text={t`Copy`}
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
    setTimeout(() => setBG(window.flowchartFunGetGraphThemeBG()), 0);
    setTimeout(() => {
      (async () => {
        const svg = await window.flowchartFunGetSVG();
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
