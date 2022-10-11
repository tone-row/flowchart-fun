import { memo, ReactNode, Suspense, useContext } from "react";
import { useRouteMatch } from "react-router-dom";

import { useFullscreen } from "../lib/hooks";
import { Box } from "../slang";
import { AppContext } from "./AppContext";
import ColorMode from "./ColorMode";
import CurrentTab from "./CurrentTab";
import styles from "./Layout.module.css";
import Loading from "./Loading";
import { Menu } from "./Menu";
// import { SharedHeader } from "./SharedHeader";
import ShareDialog from "./ShareDialog";

const Layout = memo(
  ({ children, fullText }: { children: ReactNode; fullText: string }) => {
    const isFullscreen = useFullscreen();
    const { url } = useRouteMatch();
    const tab = useContext(AppContext).showing;
    return (
      <LayoutWrapper isFullscreen={isFullscreen} key={url}>
        {isFullscreen ? null : <Menu fullText={fullText} />}
        {/* {isFullscreen ? null : <SharedHeader />} */}
        <EditorWrapper>
          <CurrentTab>{children}</CurrentTab>
        </EditorWrapper>
        <ColorMode />
        {tab === "editor" && <ShareDialog />}
      </LayoutWrapper>
    );
  }
);

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
