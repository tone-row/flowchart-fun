import { t } from "@lingui/macro";
import cx from "classnames";
import { X } from "phosphor-react";
import { lazy, memo, ReactNode, Suspense, useState } from "react";

import { useFullscreen, useIsEditorView } from "../lib/hooks";
import { Box } from "../slang";
import ColorMode from "./ColorMode";
import { FlowchartChatBar } from "./FlowchartChatBar";
import { Header } from "./Header";
import styles from "./Layout.module.css";
import Loading from "./Loading";
import { VersionCheck } from "./VersionCheck";
const PaywallModal = lazy(() => import("./PaywallModal"));

const Layout = memo(({ children }: { children: ReactNode }) => {
  const isFullscreen = useFullscreen();
  const isEditorView = useIsEditorView();
  const [messageDismissed, setMessageDismissed] = useState(false);
  const [chatBarDismissed, setChatBarDismissed] = useState(
    () => localStorage.getItem(CHAT_BAR_DISMISSED_KEY) === "true"
  );
  const banner = getBanner({
    isFullscreen,
    messageDismissed,
    chatBarDismissed,
  });

  return (
    <>
      <Box
        root
        className={styles.LayoutWrapper}
        data-showing={isEditorView ? "editor" : undefined}
        data-fullscreen={isFullscreen}
        data-banner={banner?.kind}
      >
        {banner?.kind === "message" ? (
          <div
            className={cx("flex justify-center items-center w-full gap-2", {
              "bg-red-100 text-red-700": banner.tone === "error",
              "bg-blue-100 text-blue-700": banner.tone === "info",
            })}
          >
            <span className="text-sm text-center py-4">{banner.text}</span>
            <button
              type="button"
              aria-label={t`Close`}
              onClick={() => setMessageDismissed(true)}
            >
              <X size={24} />
            </button>
          </div>
        ) : banner?.kind === "flowchart-chat" ? (
          <FlowchartChatBar
            onDismiss={() => {
              localStorage.setItem(CHAT_BAR_DISMISSED_KEY, "true");
              setChatBarDismissed(true);
            }}
          />
        ) : null}
        {isFullscreen ? null : <Header />}
        <Suspense fallback={<Loading />}>{children}</Suspense>
        <ColorMode />
      </Box>
      <VersionCheck />
      <Suspense fallback={null}>
        <PaywallModal />
      </Suspense>
    </>
  );
});

Layout.displayName = "Layout";

export default Layout;

const CHAT_BAR_DISMISSED_KEY = "ff-flowchart-chat-bar-dismissed";

type Banner =
  | { kind: "message"; text: string; tone: "error" | "info" }
  | { kind: "flowchart-chat" };

function getBanner({
  isFullscreen,
  messageDismissed,
  chatBarDismissed,
}: {
  isFullscreen: boolean;
  messageDismissed: boolean;
  chatBarDismissed: boolean;
}): Banner | null {
  if (isFullscreen) return null;
  const message = getUrlMessage();
  if (message && !messageDismissed) return message;
  if (!chatBarDismissed) return { kind: "flowchart-chat" };
  return null;
}

function getUrlMessage(): Extract<Banner, { kind: "message" }> | null {
  const hash = window.location.hash;
  if (hash.startsWith("#message=")) {
    return {
      kind: "message",
      text: decodeURIComponent(hash.slice("#message=".length)),
      tone: "info",
    };
  }
  const search = window.location.search;
  if (search.startsWith("?error=")) {
    const params = new URLSearchParams(search);
    const error = params.get("error");
    const errorDescription = params.get("error_description");
    if (error && errorDescription) {
      return { kind: "message", text: errorDescription, tone: "error" };
    }
  }
  return null;
}
