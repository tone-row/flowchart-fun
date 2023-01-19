import { Trans } from "@lingui/macro";
import produce from "immer";
import React, { ReactNode } from "react";

import { parsers, useParser } from "../lib/parsers";
import { useDoc } from "../lib/prepareChart";
import { Box, Type } from "../slang";
import styles from "./EditorOptions.module.css";
import { SyntaxHelpDialog } from "./SyntaxHelpDialog";

export function EditorOptions({ children }: { children: ReactNode }) {
  const parser = useParser();
  const parserOption = parsers.find((p) => p.value === parser);
  if (!parserOption) throw new Error("Invalid parser");

  return (
    <div className={styles.editorOptions}>
      <Box p={2} flow="column" content="normal space-between" pl={6}>
        {parser === "graph-selector" ? <SyntaxHelpDialog /> : <span />}
        <Box as="label" flow="column" gap={2} items="center normal">
          <Type size={-1} color="color-lineNumbers">
            <Trans>Syntax</Trans>
          </Type>
          <Type
            as="select"
            size={-1}
            className={styles.select}
            background="color-lineNumbers"
            value={parser}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              useDoc.setState((state) => {
                return produce(state, (draft) => {
                  draft.meta.parser = e.target.value;
                });
              });
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
