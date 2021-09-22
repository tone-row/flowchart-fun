import { memo, ReactNode, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useFeature } from "flagged";
import { Box } from "../slang";
import Menu from "./Menu";
import ColorMode from "./ColorMode";
import { AppContext } from "./AppContext";
import CurrentTab from "./CurrentTab";
import MenuNext from "./MenuNext";
import styles from "./Layout.module.css";

const Layout = memo(({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const isFullscreen = pathname === "/f";
  const isNext = useFeature("next");

  if (isNext)
    return (
      <LayoutWrapperNext>
        {isFullscreen ? null : <MenuNext />}
        <EditorWrapperNext>
          <CurrentTab>{children}</CurrentTab>
        </EditorWrapperNext>
        <ColorMode />
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

function LayoutWrapperNext({ children }: { children: ReactNode }) {
  const { showing } = useContext(AppContext);
  return <Box root={showing === "editor"}>{children}</Box>;
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
