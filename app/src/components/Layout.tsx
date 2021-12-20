import { memo, ReactNode, Suspense, useContext } from "react";
import { useRouteMatch } from "react-router-dom";

import { useFullscreen } from "../lib/hooks";
import { Box } from "../slang";
import { AppContext } from "./AppContext";
import ColorMode from "./ColorMode";
import CurrentTab from "./CurrentTab";
import styles from "./Layout.module.css";
import Loading from "./Loading";
import MenuNext from "./MenuNext";
import ShareDialog from "./ShareDialog";

const Layout = memo(({ children }: { children: ReactNode }) => {
  const isFullscreen = useFullscreen();
  const { url } = useRouteMatch();
  return (
    <LayoutWrapper isFullscreen={isFullscreen} key={url}>
      {isFullscreen ? null : <MenuNext />}
      <EditorWrapper>
        <CurrentTab>{children}</CurrentTab>
      </EditorWrapper>
      <ColorMode />
      <ShareDialog />
    </LayoutWrapper>
  );
});

Layout.displayName = "Layout";

export default Layout;

function LayoutWrapper({
  children,
  isFullscreen,
}: {
  children: ReactNode;
  isFullscreen: boolean;
}) {
  const { showing } = useContext(AppContext);
  return (
    <Box
      root
      className={styles.LayoutWrapper}
      data-showing={showing}
      data-fullscreen={isFullscreen}
    >
      {children}
    </Box>
  );
}

function EditorWrapper({ children }: { children: ReactNode }) {
  const { showing, mobileEditorTab } = useContext(AppContext);
  return (
    <Box
      as="main"
      className={styles.EditorWrapperNext}
      data-showing={showing}
      data-mobile-tab={mobileEditorTab}
      template="[main] minmax(0, 1fr) auto / [main] minmax(0, 1fr)"
    >
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </Box>
  );
}
