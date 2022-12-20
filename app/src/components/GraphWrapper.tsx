import { ReactNode } from "react";

import { useFullscreen, useIsEditorView } from "../lib/hooks";
import { Box } from "../slang";
import { GraphFloatingMenu } from "./GraphFloatingMenu";
import styles from "./GraphWrapper.module.css";

export default function GraphWrapper({ children }: { children: ReactNode }) {
  const isFullscreen = useFullscreen();

  // TODO: investigate and fix this unknown showing variable...
  const showing = useIsEditorView();
  return (
    <Box
      data-showing={showing ? "editor" : undefined}
      className={styles.GraphWrapper}
      data-is-fullscreen={isFullscreen}
      at={isFullscreen ? undefined : { tablet: { pr: 2, pb: 2 } }}
    >
      {isFullscreen ? (
        children
      ) : (
        <Box
          template={"minmax(0, 1fr) / minmax(0, 1fr)"}
          className={styles.GraphWrapperInner}
        >
          {children}
          <GraphFloatingMenu />
        </Box>
      )}
    </Box>
  );
}
