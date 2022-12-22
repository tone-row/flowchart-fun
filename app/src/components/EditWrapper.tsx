import { ReactNode, useContext } from "react";

import { useFullscreen } from "../lib/hooks";
import { Box } from "../slang";
import { AppContext } from "./AppContext";
import styles from "./EditWrapper.module.css";
import MobileTabToggle from "./MobileTabToggle";
/**
 * Adds the wrapper for the toggle between the editor and the graph
 * on mobile.
 */
export function EditWrapper({ children }: { children: ReactNode }) {
  const { mobileEditorTab } = useContext(AppContext);
  const isFullscreen = useFullscreen();
  return (
    <Box
      as="main"
      className={styles.EditWrapper}
      data-mobile-tab={mobileEditorTab}
      template="[main] minmax(0, 1fr) auto / [main] minmax(0, 1fr)"
    >
      {children}
      {!isFullscreen && <MobileTabToggle />}
    </Box>
  );
}
