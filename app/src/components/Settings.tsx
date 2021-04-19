import React, { memo, ReactNode, useCallback, useContext } from "react";
import { Box, BoxProps, Type } from "../slang";
import styles from "./Settings.module.css";
import { AppContext } from "./AppContext";
import GraphOptions from "./GraphOptions";
import { Trans } from "@lingui/macro";
import { languages } from "../locales/i18n";

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
  const { updateUserSettings, mode, language } = useContext(AppContext);
  const setLightMode = useCallback(() => {
    updateUserSettings({ mode: "light" });
    window.plausible("Set Appearance", { props: { mode: "light" } });
  }, [updateUserSettings]);
  const setDarkMode = useCallback(() => {
    updateUserSettings({ mode: "dark" });
    window.plausible("Set Appearance", { props: { mode: "dark" } });
  }, [updateUserSettings]);
  const changeLanguage = useCallback(
    (l: string) => {
      updateUserSettings({ language: l });
      window.plausible("Set Language", { props: { language: l } });
    },
    [updateUserSettings]
  );

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
          <Type weight="700">
            <Trans>User Preferences</Trans>
          </Type>
          <Box gap={2}>
            <Type size={-1}>
              <Trans>Language</Trans>
            </Type>
            <Box flow="column" gap={4}>
              {Object.keys(languages).map((locale) => (
                <Box
                  as="button"
                  key={locale}
                  className={styles.Language}
                  disabled={language === locale}
                  onClick={() => changeLanguage(locale)}
                  aria-label={`Select Language: ${
                    languages[locale as keyof typeof languages]
                  }`}
                >
                  <Type size={-2}>
                    {languages[locale as keyof typeof languages]}
                  </Type>
                </Box>
              ))}
            </Box>
          </Box>
          <Box gap={2}>
            <Type size={-1}>
              <Trans>Appearance</Trans>
            </Type>
            <Box flow="column">
              <GroupButton
                disabled={mode === "light"}
                aria-pressed={mode === "light"}
                aria-label="Light Mode"
                onClick={setLightMode}
              >
                <Trans>Light Mode</Trans>
              </GroupButton>
              <GroupButton
                disabled={mode === "dark"}
                aria-pressed={mode === "dark"}
                aria-label="Dark Mode"
                onClick={setDarkMode}
              >
                <Trans>Dark Mode</Trans>
              </GroupButton>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box gap={4} className={styles.LowerLinks}>
        <Type as="a" href="https://tone-row.com" size={-1}>
          <Trans>
            Made by <strong>Tone Row</strong>
          </Trans>
        </Type>
        <Box gap={2} at={lowerLinksAt}>
          <Type as="a" href="https://twitter.com/row_tone" size={-2}>
            <Trans>Follow Us</Trans>
          </Type>
          <Type
            as="a"
            href="https://github.com/tone-row/flowchart-fun"
            size={-2}
          >
            <Trans>View on Github</Trans>
          </Type>
          <Type
            as="a"
            href="https://opencollective.com/tone-row/donate"
            size={-2}
            onClick={() => window.plausible("Make a Donation")}
          >
            <Trans>Make a Donation</Trans>
          </Type>
          <Type
            as="a"
            href="https://github.com/sponsors/tone-row"
            size={-2}
            onClick={() => window.plausible("Become a Sponsor")}
          >
            <Trans>Become a Sponsor</Trans>
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
