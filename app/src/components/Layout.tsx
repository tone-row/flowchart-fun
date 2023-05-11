import { memo, ReactNode, Suspense } from "react";

import { useFullscreen, useIsEditorView } from "../lib/hooks";
import { Box } from "../slang";
import ColorMode from "./ColorMode";
import { Header } from "./Header";
import styles from "./Layout.module.css";
import Loading from "./Loading";
import ShareDialog from "./ShareDialog";
import { VersionCheck } from "./VersionCheck";

const Layout = memo(({ children }: { children: ReactNode }) => {
  const isFullscreen = useFullscreen();
  const hash = window.location.hash;
  const showBanner = hash.startsWith("#message=");
  const isEditorView = useIsEditorView();
  return (
    <>
      <Box
        root
        className={styles.LayoutWrapper}
        data-showing={isEditorView ? "editor" : undefined}
        data-fullscreen={isFullscreen}
        data-banner={showBanner}
      >
        {showBanner && (
          <Box className={styles.Banner} p={3}>
            <span className="text-sm">
              {decodeURIComponent(
                hash.slice("#message=".length).replace(/\+/g, "%20")
              )}
            </span>
          </Box>
        )}
        {isFullscreen ? null : <Header />}
        <Suspense fallback={<Loading />}>{children}</Suspense>
        <ColorMode />
      </Box>
      {isEditorView && <ShareDialog />}
      <VersionCheck />
    </>
  );
});

Layout.displayName = "Layout";

export default Layout;
