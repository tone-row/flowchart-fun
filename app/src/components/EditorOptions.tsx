import { Trans } from "@lingui/macro";
import produce from "immer";
import React, { ReactNode } from "react";

import { useIsValidSponsor } from "../lib/hooks";
import { Box } from "../slang";
import styles from "./EditorOptions.module.css";
import { ImportDataDialog } from "./ImportDataDialog";
import { ImportDataUnauthenticatedDialog } from "./ImportDataUnauthenticatedDialog";
import { LearnSyntaxDialog } from "./LearnSyntaxDialog";

export function EditorOptions({ children }: { children: ReactNode }) {
  const isValidSponsor = useIsValidSponsor();

  return (
    <div className={styles.editorOptions}>
      <Box p={2} flow="column" content="normal space-between" pl={6}>
        <div className="flex content-start gap-2 items-center">
          <LearnSyntaxDialog />
          <span className="bg-blue-300 h-4 w-px dark:bg-blue-900" />
          {isValidSponsor ? (
            <ImportDataDialog />
          ) : (
            <ImportDataUnauthenticatedDialog />
          )}
        </div>
      </Box>
      {children}
    </div>
  );
}
