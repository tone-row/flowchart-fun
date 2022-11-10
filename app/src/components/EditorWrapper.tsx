import { Trans } from "@lingui/macro";
import { useContext } from "react";
import { FaShare } from "react-icons/fa";

import { useIsReadOnly, useTitle } from "../lib/hooks";
import { Type } from "../slang";
import { AppContext } from "./AppContext";
import { CloneButton } from "./CloneButton";
import styles from "./EditorWrapper.module.css";
import { RenameButton } from "./RenameButton";

export function EditorWrapper({
  children,
  fullText,
}: {
  children: React.ReactNode;
  fullText: string;
}) {
  const [title] = useTitle();
  const { setShareModal } = useContext(AppContext);
  const isReadOnly = useIsReadOnly();
  return (
    <div className={styles.EditorWrapper}>
      <header>
        <div className={styles.HeaderTitle}>
          <RenameButton fullText={fullText}>
            <Type
              as="h1"
              weight="400"
              className={styles.WorkspaceTitle}
              size={2}
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
            <CloneButton fullText={fullText} />
          ) : (
            <button
              className={styles.ShareButton}
              onClick={() => setShareModal(true)}
            >
              <FaShare size={20} />
              <Type as="span">Export</Type>
            </button>
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
