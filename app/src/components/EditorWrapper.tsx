import { Trans } from "@lingui/macro";
import { Suspense, useContext } from "react";

import { useIsReadOnly } from "../lib/hooks";
import { useDocDetails } from "../lib/useDoc";
import { Button2 } from "../ui/Shared";
import { PageTitle } from "../ui/Typography";
import { AppContext } from "./AppContext";
import { CloneButton } from "./CloneButton";
import styles from "./EditorWrapper.module.css";
import Loading from "./Loading";
import { MightLoseSponsorTrigger } from "./MightLoseSponsorTrigger";
import { MightLoseWarning } from "./MightLoseWarning";
import { RenameButton } from "./RenameButton";
import ShareDialog from "./ShareDialog";
import { FloppyDisk, Share } from "phosphor-react";
import classNames from "classnames";

/**
 * Adds title and export button to the editor
 */
export function EditorWrapper({ children }: { children: React.ReactNode }) {
  const title = useDocDetails("title", "flowchart.fun");
  const { setShareModal } = useContext(AppContext);
  const isReadOnly = useIsReadOnly();
  const pageTitle = title || "flowchart.fun";
  return (
    <div className={styles.EditorWrapper}>
      <header
        className={classNames(styles.HeaderTitle, "flex items-center gap-2")}
      >
        <RenameButton key={pageTitle}>
          <PageTitle title={title} className="-translate-y-[2px]">
            {pageTitle}
          </PageTitle>
        </RenameButton>
        <MightLoseSponsorTrigger />
        <MightLoseWarning />
        {isReadOnly && (
          <span className="text-xs text-neutral-400 dark:text-neutral-600 font-extrabold uppercase tracking-tight">
            <Trans>Read-only</Trans>
          </span>
        )}
        {isReadOnly ? (
          <CloneButton />
        ) : (
          <>
            <Button2
              color="purple"
              leftIcon={<FloppyDisk className="w-4 h-4" />}
            >
              <Trans>Save</Trans>
            </Button2>
            <ShareDialog>
              <Button2
                color="blue"
                onClick={() => setShareModal(true)}
                leftIcon={<Share className="w-4 h-4" />}
                aria-label="Export"
              >
                <Trans>Share</Trans>
              </Button2>
            </ShareDialog>
          </>
        )}
      </header>
      <Suspense fallback={<Loading />}>
        <main>{children}</main>
      </Suspense>
    </div>
  );
}
