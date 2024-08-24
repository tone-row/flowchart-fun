/* eslint-disable jsx-a11y/no-distracting-elements */
import cx from "classnames";
import { X } from "phosphor-react";
import { memo, ReactNode, Suspense, useState } from "react";
import { Link } from "react-router-dom";

import { useFullscreen, useIsEditorView } from "../lib/hooks";
import { Box } from "../slang";
import ColorMode from "./ColorMode";
import { Header } from "./Header";
import styles from "./Layout.module.css";
import Loading from "./Loading";
import { VersionCheck } from "./VersionCheck";
import { PaywallModal } from "./PaywallModal";
import { Trans } from "@lingui/macro";

const Layout = memo(({ children }: { children: ReactNode }) => {
  const isFullscreen = useFullscreen();
  let [showBanner, message, messageType] = getShowBannerAndMessage();
  const isEditorView = useIsEditorView();

  const [showPHBanner, setShowPHBanner] = useState<boolean>(isPHBannerTime());

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
        data-banner={showBanner || showPHBanner}
      >
        {showPHBanner ? (
          <ProductHuntBanner
            hide={() => {
              setShowPHBanner(false);
              // set a cookie to not show the banner again
              document.cookie = `showPHBanner=false; path=/; max-age=${
                60 * 60 * 24 * 30
              }`;
            }}
          />
        ) : null}
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

/**
 * Extremely Temporary Producthunt Banner
 */
export function ProductHuntBanner({ hide }: { hide: () => void }) {
  return (
    <a
      href="https://www.producthunt.com/posts/flowchart-fun-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-flowchart-fun-2"
      target="_blank"
      rel="noopener noreferrer"
      className="relative bg-gradient-to-b from-orange-400 to-orange-300/80 text-[#443214] hidden md:flex items-center justify-center group"
      onClick={hide}
    >
      <p className="text-sm font-bold pl-4 z-10">
        <Trans>
          Love Flowchart Fun? Support us with a vote on Product Hunt!
        </Trans>
      </p>
      <div className="w-[64px] h-[52px] overflow-hidden relative mix-blend-multiply rounded-full z-10">
        <div className="absolute -top-px -right-px w-[250px] h-[54px]">
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=483202&theme=neutral"
            alt="Flowchart Fun - Text-to-Flowchart with AI Magic 🪄 | Product Hunt"
            width={250}
            height={54}
          />
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-amber-500 hidden group-hover:block animate-pulseIn" />
    </a>
  );
}

/**
 * This function returns true if it's August 25th, 2024, between 12:00am and 11:59pm PST
 */
export function isPHBannerTime() {
  // check if the cookie exists
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("showPHBanner="));
  if (cookie) {
    return false;
  }

  const pstDate = new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
  });
  const [date] = pstDate.split(", ");
  const [month, day, year] = date.split("/").map(Number);

  return year === 2024 && month === 8 && day === 25;
}
