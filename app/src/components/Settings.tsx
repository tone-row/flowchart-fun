import React, { ReactNode, useContext } from "react";
import { Box, BoxProps, Type } from "../slang";
import styles from "./Settings.module.css";
import { AppContext } from "./AppContext";

export default function Settings() {
  const { updateUserSettings, mode } = useContext(AppContext);
  return (
    <Box
      px={4}
      pb={4}
      pt={2}
      at={{ tablet: { pb: 0 } }}
      template="minmax(0, 1fr) auto / none"
    >
      <Box content="start" gap={4}>
        <Type size={-1} weight="700">
          Preferences
        </Type>
        <Box flow="column">
          <GroupButton
            disabled={mode === "light"}
            aria-selected={mode === "light"}
            onClick={() => updateUserSettings({ mode: "light" })}
          >
            Light Mode
          </GroupButton>
          <GroupButton
            disabled={mode === "dark"}
            aria-selected={mode === "dark"}
            onClick={() => updateUserSettings({ mode: "dark" })}
          >
            Dark Mode
          </GroupButton>
        </Box>
      </Box>
      <Box
        flow="column"
        items="end normal"
        content="normal space-between"
        self="stretch"
        gap={12}
        className={styles.LowerLinks}
      >
        <Box gap={2}>
          <Type as="a" href="https://js.cytoscape.org/" size={-1}>
            Built with Cytoscape.js
          </Type>
          <Type
            as="a"
            href="https://github.com/tone-row/flowchart-fun"
            size={-1}
          >
            Hosted on Github
          </Type>
          <Box flow="column" gap={4} items="end normal">
            <Type as="a" href="https://tone-row.com" size={-1}>
              Made by{" "}
              <Type weight="700" as="span" size={-1}>
                Tone Row
              </Type>
            </Type>
            <Type as="a" href="https://twitter.com/row_tone" size={-2}>
              Follow Us
            </Type>
            <Type as="a" href="https://twitter.com/row_tone" size={-2}>
              Make a Donation
            </Type>
            <Type as="a" href="https://twitter.com/row_tone" size={-2}>
              Become a Sponsor
            </Type>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function GroupButton({
  children,
  ...props
}: { children: ReactNode } & BoxProps) {
  return (
    <Box as="button" p={3} className={styles.GroupButton} {...props}>
      <Type size={-1}>{children}</Type>
    </Box>
  );
}
