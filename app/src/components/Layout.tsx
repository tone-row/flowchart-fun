import { memo, ReactNode, useContext } from "react";
import { Box } from "../slang";
import Menu from "./Menu";
import styles from "./Layout.module.css";
import ColorMode from "./ColorMode";
import { AppContext } from "./AppContext";
import { useLocation } from "react-router-dom";

const Layout = memo(({ children }: { children: ReactNode }) => {
  const { showing } = useContext(AppContext);
  const { pathname } = useLocation();
  const isFullscreen = pathname === "/f";
  return (
    <Box
      root
      overflow="hidden"
      className={styles.Layout}
      template={
        isFullscreen ? "minmax(0, 1fr) / none" : "auto minmax(0, 1fr) / none"
      }
    >
      {isFullscreen ? null : <Menu />}
      <Box
        as="main"
        className={isFullscreen ? undefined : styles.TabletWrapper}
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
