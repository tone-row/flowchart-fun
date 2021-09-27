import { memo, ReactNode, Suspense, useContext } from "react";
import { Box } from "../slang";
import Menu from "./Menu";
import styles from "./Layout.module.css";
import ColorMode from "./ColorMode";
import { AppContext } from "./AppContext";
import CurrentTab from "./CurrentTab";
import { useFeature } from "flagged";
import MenuNext from "./MenuNext";
import Loading from "./Loading";
import Share from "./Share";
import ShareDialog from "./ShareDialog";
import { useFullscreen } from "../hooks";

const Layout = memo(({ children }: { children: ReactNode }) => {
  const isFullscreen = useFullscreen();
  const isNext = useFeature("next");

  if (isNext)
    return (
      <LayoutWrapperNext isFullscreen={isFullscreen}>
        {isFullscreen ? null : <MenuNext />}
        <EditorWrapperNext>
          <CurrentTab>{children}</CurrentTab>
        </EditorWrapperNext>
        <ColorMode />
        <ShareDialog />
      </LayoutWrapperNext>
    );

  return (
    <LayoutWrapper isFullscreen={isFullscreen}>
      {isFullscreen ? null : <Menu />}
      <EditorWrapper isFullscreen={isFullscreen}>{children}</EditorWrapper>
      <ColorMode />
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
  return (
    <Box
      root
      overflow="hidden"
      className={styles.Layout}
      template={
        isFullscreen ? "minmax(0, 1fr) / none" : "auto minmax(0, 1fr) / none"
      }
    >
      {children}
    </Box>
  );
}

function LayoutWrapperNext({
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

function EditorWrapper({
  children,
  isFullscreen,
}: {
  children: ReactNode;
  isFullscreen: boolean;
}) {
  return (
    <Box
      as="main"
      className={isFullscreen ? undefined : styles.TabletWrapper}
      at={{ tablet: { display: "flex", template: "none / none" } }}
      data-showing="editor"
    >
      {children}
    </Box>
  );
}

function EditorWrapperNext({ children }: { children: ReactNode }) {
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
