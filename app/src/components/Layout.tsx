import { ReactNode, useState } from "react";
import { Box } from "../slang";
import Menu from "./Menu";
import styles from "./Layout.module.css";
import { LayoutContext, Showing } from "../constants";

export default function Layout({ children }: { children: ReactNode }) {
  const [showing, setShowing] = useState<Showing>("editor");
  return (
    <LayoutContext.Provider value={{ showing }}>
      <Box
        root
        overflow="hidden"
        className={styles.Layout}
        template="auto minmax(0, 1fr) / none"
      >
        <Menu setShowing={setShowing} />
        <Box
          className={styles.TabletWrapper}
          at={{ tablet: { display: "flex", template: "none / none" } }}
          data-showing={showing}
        >
          {children}
        </Box>
      </Box>
    </LayoutContext.Provider>
  );
}
