import { Trans } from "@lingui/macro";
import produce from "immer";
import React, { ReactNode } from "react";

import { useIsValidSponsor } from "../lib/hooks";
import { parsers, useParser } from "../lib/parsers";
import { useDoc } from "../lib/useDoc";
import { Box, Type } from "../slang";
import styles from "./EditorOptions.module.css";
import { ImportDataDialog } from "./ImportDataDialog";
import { ImportDataUnauthenticatedDialog } from "./ImportDataUnauthenticatedDialog";
import { LearnSyntaxDialog } from "./LearnSyntaxDialog";

export function EditorOptions({ children }: { children: ReactNode }) {
  const parser = useParser();
  const parserOption = parsers.find((p) => p.value === parser);
  if (!parserOption) throw new Error("Invalid parser");
  const isValidSponsor = useIsValidSponsor();

  return (
    <div className={styles.editorOptions}>
      <Box p={2} flow="column" content="normal space-between" pl={6}>
        <div className="flex content-start gap-2 items-center">
          {parser === "graph-selector" ? (
            <>
              <LearnSyntaxDialog />
              <span className="bg-blue-300 h-4 w-px dark:bg-blue-900" />
              {isValidSponsor ? (
                <ImportDataDialog />
              ) : (
                <ImportDataUnauthenticatedDialog />
              )}
            </>
          ) : (
            <span />
          )}
        </div>
        <Box as="label" flow="column" gap={2} items="center normal">
          <Type size={-1} color="color-lineNumbers">
            <Trans>Syntax</Trans>
          </Type>
          <Type
            as="select"
            size={-1}
            className={styles.select}
            color="color-foreground"
            background="color-lineNumbers"
            value={parser}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              useDoc.setState(
                (state) => {
                  return produce(state, (draft) => {
                    draft.meta.parser = e.target.value;
                  });
                },
                false,
                "syntax"
              );
            }}
          >
            {parsers.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label()}
              </option>
            ))}
          </Type>
        </Box>
      </Box>
      {children}
    </div>
  );
}
