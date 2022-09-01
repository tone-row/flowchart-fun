import React, { ReactNode, useContext } from "react";
import { useRouteMatch } from "react-router-dom";

import { HiddenGraphOptions } from "../lib/helpers";
import { useFullscreen, useIsValidSponsor } from "../lib/hooks";
import { Box } from "../slang";
import { AppContext } from "./AppContext";
import GraphOptionsBar from "./GraphOptionsBar";
import styles from "./GraphWrapper.module.css";

export default function GraphWrapper({
  children,
  setHiddenGraphOptions,
}: {
  children: ReactNode;
  setHiddenGraphOptions?: (newOptions: HiddenGraphOptions) => void;
}) {
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
      data-showing={showing}
      className={styles.GraphWrapper}
      data-is-fullscreen={isFullscreen}
      at={isFullscreen ? undefined : { tablet: { pr: 2, pb: 2 } }}
    >
      {!isFullscreen ? (
        <Box
          template={template}
          className={styles.GraphWrapperInner}
          at={{ tablet: { rad: 1 } }}
        >
          {shouldHideGraphOptions ? null : (
            <GraphOptionsBar setHiddenGraphOptions={setHiddenGraphOptions} />
          )}
          {children}
        </Box>
      ) : (
        children
      )}
    </Box>
  );
}
