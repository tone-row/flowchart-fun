import { memo, ReactNode, Suspense, useContext } from "react";
import { Box } from "../slang";
import styles from "./Layout.module.css";
import ColorMode from "./ColorMode";
import { AppContext } from "./AppContext";
import CurrentTab from "./CurrentTab";
import MenuNext from "./MenuNext";
import Loading from "./Loading";
import Share from "./Share";
import ShareDialog from "./ShareDialog";
import { useFullscreen } from "../hooks";

const Layout = memo(({ children }: { children: ReactNode }) => {
  const isFullscreen = useFullscreen();

  return (
    <LayoutWrapper isFullscreen={isFullscreen}>
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
  const { showing, shareModal } = useContext(AppContext);
  return (
    <>
      <Box
        root
        className={styles.LayoutWrapperNext}
        data-showing={showing}
        data-fullscreen={isFullscreen}
      >
        {children}
      </Box>
      {shareModal && <Share />}
    </>
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
