import { Trans } from "@lingui/macro";
import Cookies from "js-cookie";
import { ArrowRight } from "phosphor-react";
import { memo, ReactNode, Suspense, useState } from "react";
import { Link } from "react-router-dom";

import { useFullscreen, useIsEditorView } from "../lib/hooks";
import { Box } from "../slang";
import ColorMode from "./ColorMode";
import { Header } from "./Header";
import styles from "./Layout.module.css";
import Loading from "./Loading";
import { VersionCheck } from "./VersionCheck";

const Layout = memo(({ children }: { children: ReactNode }) => {
  const isFullscreen = useFullscreen();
  const hash = window.location.hash;
  const showBanner = hash.startsWith("#message=");
  const [showImportantMessage, setShowImportantMessage] = useState(
    Cookies.get("ff_viewed_important_message") !== "true"
  );
  const isEditorView = useIsEditorView();
  return (
    <>
      <Box
        root
        className={styles.LayoutWrapper}
        data-showing={isEditorView ? "editor" : undefined}
        data-fullscreen={isFullscreen}
        data-banner={showBanner || showImportantMessage}
      >
        {showBanner ? (
          <Box className={styles.Banner} p={3}>
            <span className="text-sm">
              {decodeURIComponent(
                hash.slice("#message=".length).replace(/\+/g, "%20")
              )}
            </span>
          </Box>
        ) : null}
        {showImportantMessage && (
          <ImportantChanges
            closeBanner={() => {
              setShowImportantMessage(false);
            }}
          />
        )}
        {isFullscreen ? null : <Header />}
        <Suspense fallback={<Loading />}>{children}</Suspense>
        <ColorMode />
      </Box>
      {/* {isEditorView && <ShareDialog />} */}
      <VersionCheck />
    </>
  );
});

Layout.displayName = "Layout";

export default Layout;

function ImportantChanges({ closeBanner }: { closeBanner: () => void }) {
  return (
    <Link
      to="/blog/post/important-changes-coming"
      className="bg-blue-100 text-blue-700 p-4 text-center text-md"
      onClick={() => {
        Cookies.set("ff_viewed_important_message", "true");
        closeBanner();
      }}
    >
      <span className="inline-flex gap-2 items-center">
        <Trans>Important Changes are Coming to Flowchart Fun.</Trans>
        <span className="font-bold">
          <Trans>Learn More</Trans>
        </span>
        <ArrowRight size={24} />
      </span>
    </Link>
  );
}
