import { ReactNode } from "react";
import { useRouteMatch } from "react-router-dom";

import {
  useFullscreen,
  useIsEditorView,
  useIsValidSponsor,
} from "../lib/hooks";
import { UpdateDoc } from "../lib/UpdateDoc";
import { Box } from "../slang";
import { GraphFloatingMenu } from "./GraphFloatingMenu";
import GraphOptionsBar from "./GraphOptionsBar";
import styles from "./GraphWrapper.module.css";
import { UseGraphOptionsReturn } from "./useGraphOptions";

export default function GraphWrapper({
  children,
  update,
  options,
  isFrozen,
}: {
  children: ReactNode;
  update?: UpdateDoc;
  options: UseGraphOptionsReturn;
  isFrozen: boolean;
}) {
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
        <Box template={template} className={styles.GraphWrapperInner}>
          {shouldHideGraphOptions || !update ? null : (
            <GraphOptionsBar
              update={update}
              options={options}
              isFrozen={isFrozen}
            />
          )}
          {children}
          <GraphFloatingMenu />
        </Box>
      )}
    </Box>
  );
}
