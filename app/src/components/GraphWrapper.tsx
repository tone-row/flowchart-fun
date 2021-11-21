import React, { ReactNode, useContext } from "react";
import { useRouteMatch } from "react-router";

import { useFullscreen, useIsValidSponsor } from "../lib/hooks";
import { Box } from "../slang";
import { AppContext } from "./AppContext";
import GraphOptionsBar from "./GraphOptionsBar";
import styles from "./GraphWrapper.module.css";

export default function GraphWrapper({ children }: { children: ReactNode }) {
  const { showing } = useContext(AppContext);
  const isFullscreen = useFullscreen();
  const { path } = useRouteMatch();
  const validSponsor = useIsValidSponsor();
  const shouldHideGraphOptions =
    (path === "/u/:id" && !validSponsor) ||
    path === "/c/:graphText?" ||
    path === "/r/:graphText?";
  const template = shouldHideGraphOptions
    ? "minmax(0, 1fr) / minmax(0, 1fr)"
    : "auto minmax(0, 1fr) / minmax(0, 1fr)";

  return (
    <Box
      className={styles.GraphWrapper}
      data-is-fullscreen={isFullscreen}
      data-showing={showing}
      at={isFullscreen ? undefined : { tablet: { pr: 2, pb: 2 } }}
    >
      {!isFullscreen ? (
        <Box
          template={template}
          className={styles.GraphWrapperInner}
          at={{ tablet: { rad: 1 } }}
        >
          {!shouldHideGraphOptions && <GraphOptionsBar />}
          {children}
        </Box>
      ) : (
        children
      )}
    </Box>
  );
}
