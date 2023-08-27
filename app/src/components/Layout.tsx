import cx from "classnames";
import { X } from "phosphor-react";
import { memo, ReactNode, Suspense } from "react";
import { Link } from "react-router-dom";

import { useFullscreen, useIsEditorView } from "../lib/hooks";
import { Box } from "../slang";
import ColorMode from "./ColorMode";
import { Header } from "./Header";
import styles from "./Layout.module.css";
import Loading from "./Loading";
import { VersionCheck } from "./VersionCheck";
import { PaywallModal } from "./PaywallModal";

const Layout = memo(({ children }: { children: ReactNode }) => {
  const isFullscreen = useFullscreen();
  let [showBanner, message, messageType] = getShowBannerAndMessage();
  const isEditorView = useIsEditorView();

  // fullscreen disables banners
  if (isFullscreen) {
    showBanner = false;
  }

  return (
    <>
      <Box
        root
        className={styles.LayoutWrapper}
        data-showing={isEditorView ? "editor" : undefined}
        data-fullscreen={isFullscreen}
        data-banner={showBanner}
      >
        {showBanner ? (
          <div
            className={cx("flex justify-center items-center w-full gap-2", {
              "bg-red-100 text-red-700": messageType === "error",
              "bg-blue-100 text-blue-700": messageType === "info",
            })}
          >
            <span className="text-sm text-center py-4">{message}</span>
            <Link to="/">
              <X size={24} />
            </Link>
          </div>
        ) : null}
        {isFullscreen ? null : <Header />}
        <Suspense fallback={<Loading />}>{children}</Suspense>
        <ColorMode />
      </Box>
      <VersionCheck />
      <PaywallModal />
    </>
  );
});

Layout.displayName = "Layout";

export default Layout;

// ?error=server_error&error_description=Multiple+accounts+with+the+same+email+address+in+the+same+linking+domain+detected%3A+default

function getShowBannerAndMessage(): [boolean, string, "error" | "info"] {
  const hash = window.location.hash;
  if (hash.startsWith("#message=")) {
    return [true, decodeURIComponent(hash.slice("#message=".length)), "info"];
  }
  const search = window.location.search;
  if (search.startsWith("?error=")) {
    const params = new URLSearchParams(search);
    const error = params.get("error");
    const errorDescription = params.get("error_description");
    if (error && errorDescription) {
      return [true, errorDescription, "error"];
    }
  }
  return [false, "", "info"];
}
