import { Trans } from "@lingui/macro";
import React, { ReactNode, useContext } from "react";
import { Box, BoxProps, Type } from "../slang";
import { AppContext } from "./AppContext";
import styles from "./Share.module.css";

export default function Share() {
  const { shareLink } = useContext(AppContext);
  return (
    <Box gap={2} content="start stretch" p={4}>
      <Button as="a" href={shareLink} rel="noreferrer" target="_blank">
        <Trans>Open Share Link</Trans>
      </Button>
      <Button onClick={() => window.flowchartFunDownloadSVG()}>
        <Trans>Download</Trans> SVG
      </Button>
      <Button onClick={() => window.flowchartFunDownloadPNG()}>
        <Trans>Download</Trans> PNG
      </Button>
      <Button onClick={() => window.flowchartFunDownloadJPG()}>
        <Trans>Download</Trans> JPG
      </Button>
    </Box>
  );
}

function Button({ children, ...props }: { children: ReactNode } & BoxProps) {
  return (
    <Box as="button" p={3} className={styles.ShareButton} {...props}>
      <Type>{children}</Type>
    </Box>
  );
}
