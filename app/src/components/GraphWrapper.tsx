import React, { ReactNode, useContext } from "react";
import { Box } from "../slang";
import { AppContext } from "./AppContext";
import styles from "./GraphWrapper.module.css";
import GraphOptionsBar from "./GraphOptionsBar";
import { useFullscreen, useIsValidSponsor } from "../hooks";
import { useRouteMatch } from "react-router";

export default function GraphWrapper({ children }: { children: ReactNode }) {
  const { showing } = useContext(AppContext);
  const isFullscreen = useFullscreen();
  const { path } = useRouteMatch();
  const validSponsor = useIsValidSponsor();
  const shouldHideGraphOptions = path === "/u/:id" && !validSponsor;
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
