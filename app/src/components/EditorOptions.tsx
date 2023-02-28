import { Trans } from "@lingui/macro";
import React, { ReactNode } from "react";

import { setMetaImmer } from "../lib/docHelpers";
import { parsers, useParser } from "../lib/parsers";
import { Box, Type } from "../slang";
import styles from "./EditorOptions.module.css";
import { SyntaxReference } from "./SyntaxReference";

export function EditorOptions({ children }: { children: ReactNode }) {
  const parser = useParser();
  const parserOption = parsers.find((p) => p.value === parser);
  if (!parserOption) throw new Error("Invalid parser");

  return (
    <div className={styles.editorOptions}>
      <Box p={2} flow="column" content="normal space-between" pl={6}>
        {parser === "graph-selector" ? <SyntaxReference /> : <span />}
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
              setMetaImmer((draft) => {
                draft.parser = e.target.value;
              }, "syntax");
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
