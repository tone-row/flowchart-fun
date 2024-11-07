import cx from "classnames";
import { X, Wrench } from "phosphor-react";
import { lazy, memo, ReactNode, Suspense, useState } from "react";

import { useFullscreen, useIsEditorView } from "../lib/hooks";
import { Box } from "../slang";
import ColorMode from "./ColorMode";
import { Header } from "./Header";
import styles from "./Layout.module.css";
import Loading from "./Loading";
import { VersionCheck } from "./VersionCheck";
import * as Dialog from "@radix-ui/react-dialog";
import { Overlay, Content } from "../ui/Dialog";
import { Trans, t } from "@lingui/macro";
const PaywallModal = lazy(() => import("./PaywallModal"));

const Layout = memo(({ children }: { children: ReactNode }) => {
  const isFullscreen = useFullscreen();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  let [showBanner, message, messageType] = getShowBannerAndMessage();
  const isEditorView = useIsEditorView();

  // Check if we're in maintenance window
  const maintenanceStart = new Date("2024-11-08T00:00:00-05:00");
  const maintenanceEnd = new Date("2024-11-08T01:00:00-05:00");
  const now = new Date();
  const isMaintenanceWindow = now >= maintenanceStart && now < maintenanceEnd;

  if (isMaintenanceWindow) {
    return (
      <Dialog.Root open>
        <Dialog.Portal>
          <Overlay />
          <Content className="grid gap-6 max-w-md p-8">
            <div className="grid gap-4">
              <Wrench className="mx-auto" size={32} weight="duotone" />
              <Dialog.Title className="text-2xl font-bold">
                <Trans>Scheduled Maintenance</Trans>
              </Dialog.Title>
            </div>
            <Dialog.Description className="grid gap-4">
              <p className="leading-normal text-wrap-pretty">
                <Trans>
                  We are currently performing a database upgrade to improve our
                  service.
                </Trans>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-normal text-wrap-pretty">
                <Trans>
                  The service will be back online at 1:00 AM Eastern Time. Thank
                  you for your patience.
                </Trans>
              </p>
            </Dialog.Description>
          </Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  // Don't show banner if it's been dismissed or if in fullscreen
  showBanner = showBanner && !bannerDismissed;

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
            <button onClick={() => setBannerDismissed(true)}>
              <X size={24} />
            </button>
          </div>
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

function getShowBannerAndMessage(): [boolean, string, "error" | "info"] {
  // Database migration banner
  const migrationDate = new Date("2024-11-08T00:00:00-05:00"); // Midnight Eastern Time
  const now = new Date();
  if (now < migrationDate) {
    return [
      true,
      t`Scheduled database maintenance will occur on Friday, November 8th at 12:00 AM Eastern Time. Services may be temporarily unavailable during this period.`,
      "info",
    ];
  }

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
