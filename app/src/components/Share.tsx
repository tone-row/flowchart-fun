import React, { ReactNode, useContext } from "react";
import { Box, BoxProps, Type } from "../slang";
import { AppContext } from "./AppContext";
import styles from "./Share.module.css";

export default function Share() {
  const { shareLink } = useContext(AppContext);
  return (
    <Box gap={2} content="start stretch" p={4}>
      <Button as="a" href={shareLink} rel="noreferrer" target="_blank">
        Open Share Link
      </Button>
      <Button onClick={() => window.flowchartFunDownloadSVG()}>
        Download SVG
      </Button>
      <Button onClick={() => window.flowchartFunDownloadPNG()}>
        Download PNG
      </Button>
      <Button onClick={() => window.flowchartFunDownloadJPG()}>
        Download JPG
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
