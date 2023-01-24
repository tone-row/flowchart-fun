import { t, Trans } from "@lingui/macro";
import { useContext } from "react";
import { FaShare } from "react-icons/fa";

import { useIsReadOnly } from "../lib/hooks";
import { useDocDetails } from "../lib/prepareChart";
import { Type } from "../slang";
import { AppContext } from "./AppContext";
import { CloneButton } from "./CloneButton";
import styles from "./EditorWrapper.module.css";
import { MightLoseWarning } from "./MightLoseWarning";
import { RenameButton } from "./RenameButton";

/**
 * Adds title and export button to the editor
 */
export function EditorWrapper({
  children,
  showMightLoseWarning,
}: {
  children: React.ReactNode;
  showMightLoseWarning?: boolean;
}) {
  const title = useDocDetails("title", "flowchart.fun");
  const { setShareModal } = useContext(AppContext);
  const isReadOnly = useIsReadOnly();
  return (
    <div
      className={[
        styles.EditorWrapper,
        showMightLoseWarning ? styles.mightLose : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header>
        <div className={styles.HeaderTitle}>
          <RenameButton>
            <Type
              as="h1"
              weight="400"
              className={styles.WorkspaceTitle}
              size={3}
              title={title}
            >
              {title || "flowchart.fun"}
            </Type>
          </RenameButton>
          {isReadOnly && (
            <Type size={-1} className={styles.readOnly}>
              <Trans>Read-only</Trans>
            </Type>
          )}
          {isReadOnly ? (
            <CloneButton />
          ) : (
            <button
              aria-label={t`Export`}
              className={styles.ShareButton}
              onClick={() => setShareModal(true)}
            >
              <FaShare size={20} />
              <Type as="span">Export</Type>
            </button>
          )}
        </div>
      </header>
      {showMightLoseWarning && <MightLoseWarning />}
      <main>{children}</main>
    </div>
  );
}
