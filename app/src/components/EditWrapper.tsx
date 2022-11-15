import { ReactNode, useContext } from "react";

import { Box } from "../slang";
import { AppContext } from "./AppContext";
import styles from "./EditWrapper.module.css";
export function EditWrapper({ children }: { children: ReactNode }) {
  const { mobileEditorTab } = useContext(AppContext);
  return (
    <Box
      as="main"
      className={styles.EditWrapper}
      data-mobile-tab={mobileEditorTab}
      template="[main] minmax(0, 1fr) auto / [main] minmax(0, 1fr)"
    >
      {children}
    </Box>
  );
}
