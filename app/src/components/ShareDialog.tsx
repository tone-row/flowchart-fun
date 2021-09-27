import Dialog from "@reach/dialog";
import VisuallyHidden from "@reach/visually-hidden";
import "@reach/dialog/styles.css";
import { ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { AppContext } from "./AppContext";
import { Box, Type } from "../slang";
import { Check, LinkSimple, X } from "phosphor-react";
import styles from "./ShareDialog.module.css";
import { t, Trans } from "@lingui/macro";

export default function ShareDialog() {
  const { shareModal, setShareModal, shareLink } = useContext(AppContext);
  const close = useCallback(() => setShareModal(false), [setShareModal]);
  const fullscreen = `${new URL(window.location.href).origin}/f#${shareLink}`;
  const withEditor = `${new URL(window.location.href).origin}/c#${shareLink}`;
  return (
    <Box
      as={Dialog}
      isOpen={shareModal}
      onDismiss={close}
      p={2}
      rad={2}
      background="color-input"
      className={styles.Dialog}
    >
      <Box gap={1}>
        <Box
          as="button"
          className={styles.CloseButton}
          onClick={close}
          self="normal end"
        >
          <VisuallyHidden>
            <Trans>Close</Trans>
          </VisuallyHidden>
          <X width={33} height={33} aria-hidden />
        </Box>
        <Box
          p={10}
          rad={1}
          background="color-background"
          className={styles.InnerDialog}
          gap={6}
          at={{
            tablet: { template: "auto / repeat(2, minmax(0, 1fr))", gap: 10 },
          }}
        >
          <Column>
            <Title>
              <Trans>Copy</Trans> URL
            </Title>
            <Box gap={4}>
              <LinkCopy value={fullscreen} title={t`Fullscreen`} />
              <LinkCopy value={withEditor} title={t`With Editor`} />
            </Box>
          </Column>
          <Column>
            <Title>
              <Trans>Download Image</Trans>
            </Title>
            <Box gap={2}>
              <Button onClick={window.flowchartFunDownloadSVG}>SVG</Button>
              <Button onClick={window.flowchartFunDownloadPNG}>PNG</Button>
              <Button onClick={window.flowchartFunDownloadJPG}>JPG</Button>
            </Box>
          </Column>
        </Box>
      </Box>
    </Box>
  );
}

function Title({ children }: { children: ReactNode }) {
  return (
    <Type size={1} className={styles.Title}>
      {children}
    </Type>
  );
}

function Column({ children }: { children: ReactNode }) {
  return (
    <Box
      className={styles.Column}
      gap={2}
      at={{ tablet: { gap: 6 } }}
      content="start normal"
    >
      {children}
    </Box>
  );
}

function Button({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Box
      p={3}
      as="button"
      className={[styles.Button, className].join(" ")}
      rad={1}
      onClick={onClick}
    >
      {children}
    </Box>
  );
}

function LinkCopy({ value, title }: { value: string; title: string }) {
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
        background="color-input"
        items="center normal"
        className={styles.LinkCopy}
        rad={1}
        gap={3}
      >
        <Box
          content="center"
          className={styles.LinkCopyLeft}
          self="stretch normal"
          pl={3}
        >
          <Icon width={18} height={18} />
        </Box>
        <Type
          size={-2}
          as="input"
          type="text"
          value={value}
          p={1}
          pl={2}
          className={styles.LinkCopyInput}
        />
        <Box p={1} pl={0}>
          <Button
            onClick={() => {
              (async () => {
                await navigator.clipboard.writeText(value);
                setCopied(true);
              })();
            }}
            className={styles.LinkCopyButton}
          >
            <Trans>Copy</Trans>
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
