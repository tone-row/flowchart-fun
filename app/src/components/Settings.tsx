import React, { memo, ReactNode, useCallback, useContext } from "react";
import { Box, BoxProps, Type } from "../slang";
import styles from "./Settings.module.css";
import { AppContext } from "./AppContext";
import GraphOptions from "./GraphOptions";

const noPaddingBottom = { tablet: { pb: 0 } };
const lowerLinksAt: BoxProps["at"] = {
  tablet: {
    pb: 4,
  },
  desktop: {
    gap: 4,
    flow: "column",
    items: "end normal",
    content: "normal start",
  },
};

const largeGap = 10;

const Settings = memo(() => {
  const { updateUserSettings, mode } = useContext(AppContext);
  const setLightMode = useCallback(() => {
    updateUserSettings({ mode: "light" });
  }, [updateUserSettings]);
  const setDarkMode = useCallback(() => {
    updateUserSettings({ mode: "dark" });
  }, [updateUserSettings]);
  return (
    <Box
      px={4}
      pb={4}
      pt={2}
      at={noPaddingBottom}
      gap={largeGap}
      template="minmax(0, 1fr) auto / none"
    >
      <Box content="start stretch" gap={largeGap}>
        <GraphOptions />
        <Box content="start" gap={4}>
          <Type weight="700">User Preferences</Type>
          <Box flow="column">
            <GroupButton
              disabled={mode === "light"}
              aria-pressed={mode === "light"}
              aria-label="Light Mode"
              onClick={setLightMode}
            >
              Light Mode
            </GroupButton>
            <GroupButton
              disabled={mode === "dark"}
              aria-pressed={mode === "dark"}
              aria-label="Dark Mode"
              onClick={setDarkMode}
            >
              Dark Mode
            </GroupButton>
          </Box>
        </Box>
      </Box>
      <Box gap={4} className={styles.LowerLinks}>
        <Type as="a" href="https://tone-row.com" size={-1}>
          Made by <strong>Tone Row</strong>
        </Type>
        <Box gap={2} at={lowerLinksAt}>
          <Type as="a" href="https://twitter.com/row_tone" size={-2}>
            Follow Us
          </Type>
          <Type
            as="a"
            href="https://github.com/tone-row/flowchart-fun"
            size={-2}
          >
            View on Github
          </Type>
          <Type
            as="a"
            href="https://opencollective.com/tone-row/donate"
            size={-2}
          >
            Make a Donation
          </Type>
          <Type as="a" href="https://github.com/sponsors/tone-row" size={-2}>
            Become a Sponsor
          </Type>
        </Box>
      </Box>
    </Box>
  );
});

Settings.displayName = "Settings";

export default Settings;

const GroupButton = memo(
  ({ children, ...props }: { children: ReactNode } & BoxProps) => {
    return (
      <Box as="button" p={3} className={styles.GroupButton} {...props}>
        <Type size={-1}>{children}</Type>
      </Box>
    );
  }
);

GroupButton.displayName = "GroupButton";
