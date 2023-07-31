import { ReactNode, Suspense } from "react";

import { useFullscreen, useIsEditorView } from "../lib/hooks";
import { Box, BoxProps } from "../slang";
import { GraphFloatingMenu } from "./GraphFloatingMenu";
import styles from "./GraphWrapper.module.css";
import Loading from "./Loading";
import TextResizer from "./TextResizer";
import classNames from "classnames";

export default function GraphWrapper({
  children,
  boxProps = {},
}: {
  children: ReactNode;
  boxProps?: Omit<BoxProps, "as">;
}) {
  const isFullscreen = useFullscreen();

  // TODO: investigate and fix this unknown showing variable...
  const showing = useIsEditorView();
  return (
    <Suspense fallback={<Loading />}>
      <Box
        data-showing={showing ? "editor" : undefined}
        className={styles.GraphWrapper}
        data-is-fullscreen={isFullscreen}
        at={isFullscreen ? undefined : { tablet: { pr: 2, pb: 2 } }}
        {...boxProps}
      >
        {isFullscreen ? (
          children
        ) : (
          <Box
            template={"minmax(0, 1fr) / minmax(0, 1fr)"}
            className={classNames(
              styles.GraphWrapperInner,
              "border dark:border-neutral-600 border-solid"
            )}
          >
            {children}
            <GraphFloatingMenu />
          </Box>
        )}
      </Box>
      <TextResizer />
    </Suspense>
  );
}
