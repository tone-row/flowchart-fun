import React, { ReactNode, useContext } from "react";
import { Box } from "../slang";
import { AppContext } from "./AppContext";
import styles from "./GraphWrapper.module.css";
import { useFeature } from "flagged";
import GraphOptionsBar from "./GraphOptionsBar";
import { useFullscreen } from "../hooks";

export default function GraphWrapper({ children }: { children: ReactNode }) {
  const { showing } = useContext(AppContext);
  const isNext = useFeature("next");
  const isFullscreen = useFullscreen();

  return (
    <Box className={styles.GraphWrapper} data-showing={showing} pb={2} pr={2}>
      {isNext && !isFullscreen ? (
        <Box
          template="auto 1fr / 1fr"
          className={styles.GraphWrapperInner}
          rad={1}
        >
          <GraphOptionsBar />
          {children}
        </Box>
      ) : (
        children
      )}
    </Box>
  );
}
