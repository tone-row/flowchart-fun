import { Trans } from "@lingui/macro";
import { Suspense, useContext } from "react";
import { RiShareForwardFill } from "react-icons/ri";

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

/**
 * Adds title and export button to the editor
 */
export function EditorWrapper({ children }: { children: React.ReactNode }) {
  const title = useDocDetails("title", "flowchart.fun");
  const { setShareModal } = useContext(AppContext);
  const isReadOnly = useIsReadOnly();
  return (
    <div className={styles.EditorWrapper}>
      <header>
        <div className={styles.HeaderTitle}>
          <RenameButton>
            <PageTitle title={title} className="-translate-y-[2px]">
              {title || "flowchart.fun"}
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
            <Button2
              color="blue"
              onClick={() => setShareModal(true)}
              rightIcon={<RiShareForwardFill size={16} />}
            >
              <Trans>Export</Trans>
            </Button2>
          )}
        </div>
      </header>
      <Suspense fallback={<Loading />}>
        <main>{children}</main>
      </Suspense>
    </div>
  );
}
