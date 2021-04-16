import { memo, ReactNode, useContext } from "react";
import { Box } from "../slang";
import Menu from "./Menu";
import styles from "./Layout.module.css";
import ColorMode from "./ColorMode";
import { AppContext } from "./AppContext";

const Layout = memo(({ children }: { children: ReactNode }) => {
  const { showing } = useContext(AppContext);
  return (
    <Box
      root
      overflow="hidden"
      className={styles.Layout}
      template="auto minmax(0, 1fr) / none"
    >
      <Menu />
      <Box
        as="main"
        className={styles.TabletWrapper}
        at={{ tablet: { display: "flex", template: "none / none" } }}
        data-showing={showing}
      >
        {children}
      </Box>
      <ColorMode />
    </Box>
  );
});

Layout.displayName = "Layout";

export default Layout;
