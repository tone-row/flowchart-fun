import { memo, ReactNode, Suspense, useContext } from "react";
import { useRouteMatch } from "react-router-dom";

import { useFullscreen } from "../lib/hooks";
import { Box, Type } from "../slang";
import { AppContext } from "./AppContext";
import ColorMode from "./ColorMode";
import CurrentTab from "./CurrentTab";
import styles from "./Layout.module.css";
import Loading from "./Loading";
import { SharedHeader } from "./SharedHeader";
import ShareDialog from "./ShareDialog";

const Layout = memo(({ children }: { children: ReactNode }) => {
  const isFullscreen = useFullscreen();
  const { url } = useRouteMatch();
  const tab = useContext(AppContext).showing;
  // For some routes, tabs should not be accessible
  const showTab = url !== "/sponsor";
  return (
    <LayoutWrapper isFullscreen={isFullscreen} key={url}>
      {isFullscreen ? null : <SharedHeader />}
      {showTab ? (
        <CurrentTabWrapper>
          <CurrentTab>{children}</CurrentTab>
        </CurrentTabWrapper>
      ) : (
        children
      )}
      <ColorMode />
      {tab === "editor" && <ShareDialog />}
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
  const hash = window.location.hash;
  const showBanner = hash.startsWith("#message=");
  return (
    <Box
      root
      className={styles.LayoutWrapper}
      data-showing={showing}
      data-fullscreen={isFullscreen}
      data-banner={showBanner}
    >
      {showBanner && (
        <Box className={styles.Banner} p={3}>
          <Type size={-1}>
            {decodeURIComponent(
              hash.slice("#message=".length).replace(/\+/g, "%20")
            )}
          </Type>
        </Box>
      )}
      {children}
    </Box>
  );
}

function CurrentTabWrapper({ children }: { children: ReactNode }) {
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
