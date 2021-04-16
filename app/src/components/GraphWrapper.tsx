import React, { ReactNode, useContext } from "react";
import { Box } from "../slang";
import { AppContext } from "./AppContext";
import styles from "./GraphWrapper.module.css";

export default function GraphWrapper({ children }: { children: ReactNode }) {
  const { showing } = useContext(AppContext);

  return (
    <Box className={styles.GraphWrapper} data-showing={showing}>
      {children}
    </Box>
  );
}
