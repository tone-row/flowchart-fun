import { ReactNode } from "react";

import { useFullscreen } from "../lib/hooks";
import { Box } from "../slang";
import styles from "./EditWrapper.module.css";
import MobileTabToggle from "./MobileTabToggle";
import { useMobileStore } from "../lib/useMobileStore";
/**
 * Adds the wrapper for the toggle between the editor and the graph
 * on mobile.
 */
export function EditWrapper({ children }: { children: ReactNode }) {
  const tab = useMobileStore((state) => state.tab);
  const isFullscreen = useFullscreen();
  return (
    <Box
      as="main"
      className={styles.EditWrapper}
      data-mobile-tab={tab}
      template="[main] minmax(0, 1fr) auto / [main] minmax(0, 1fr)"
    >
      {children}
      {!isFullscreen && <MobileTabToggle />}
    </Box>
  );
}
