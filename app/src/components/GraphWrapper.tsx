import React, { ReactNode, useContext } from "react";
import { Box } from "../slang";
import { AppContext } from "./AppContext";
import styles from "./GraphWrapper.module.css";
import GraphOptionsBar from "./GraphOptionsBar";
import { useFullscreen } from "../hooks";

export default function GraphWrapper({ children }: { children: ReactNode }) {
  const { showing } = useContext(AppContext);
  const isFullscreen = useFullscreen();

  return (
    <Box
      className={styles.GraphWrapper}
      data-showing={showing}
      at={{ tablet: { pr: 2, pb: 2 } }}
    >
      {!isFullscreen ? (
        <Box
          template="auto 1fr / 1fr"
          className={styles.GraphWrapperInner}
          at={{ tablet: { rad: 1 } }}
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
