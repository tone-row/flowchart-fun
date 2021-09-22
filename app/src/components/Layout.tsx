import { memo, ReactNode, useContext } from "react";
import { Box } from "../slang";
import Menu from "./Menu";
import styles from "./Layout.module.css";
import ColorMode from "./ColorMode";
import { AppContext } from "./AppContext";
import { useLocation } from "react-router-dom";
import { useFeature } from "flagged";
import MenuNext from "./MenuNext";
import CurrentTab from "./CurrentTab";

const Layout = memo(({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const isFullscreen = pathname === "/f";
  const isNext = useFeature("next");
  return (
    <LayoutWrapper isFullscreen={isFullscreen}>
      {isFullscreen ? null : isNext ? <MenuNext /> : <Menu />}

      {isNext ? (
        <EditorWrapperNext>
          <CurrentTab>{children}</CurrentTab>
        </EditorWrapperNext>
      ) : (
        <EditorWrapper isFullscreen={isFullscreen}>{children}</EditorWrapper>
      )}

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
  const { showing } = useContext(AppContext);
  return (
    <Box as="main" className={styles.EditorWrapperNext} data-showing={showing}>
      {children}
    </Box>
  );
}
