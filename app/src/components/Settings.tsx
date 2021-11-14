import { memo, useCallback, useContext } from "react";
import { Box, BoxProps, Type } from "../slang";
import styles from "./Settings.module.css";
import { AppContext } from "./AppContext";
import { t, Trans } from "@lingui/macro";
import { languages } from "../locales/i18n";
import { Button, Page, Section, SectionTitle } from "./Shared";

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

const Settings = memo(() => {
  const { updateUserSettings, mode, language } = useContext(AppContext);
  const setLightMode = useCallback(() => {
    document.body.classList.add("disableAnimation");
    updateUserSettings({ mode: "light" });
    window.plausible("Set Appearance", { props: { mode: "light" } });
    setTimeout(() => document.body.classList.remove("disableAnimation"), 100);
  }, [updateUserSettings]);
  const setDarkMode = useCallback(() => {
    document.body.classList.add("disableAnimation");
    updateUserSettings({ mode: "dark" });
    window.plausible("Set Appearance", { props: { mode: "dark" } });
    setTimeout(() => document.body.classList.remove("disableAnimation"), 100);
  }, [updateUserSettings]);
  const changeLanguage = useCallback(
    (l: string) => {
      updateUserSettings({ language: l });
      window.plausible("Set Language", { props: { language: l } });
    },
    [updateUserSettings]
  );

  return (
    <Box px={4} pb={4} pt={8} className={styles.Settings}>
      <Page
        content="start normal"
        at={{ tablet: { items: "start", content: "start", gap: 14 } }}
      >
        <Section>
          <SectionTitle>
            <Trans>Language</Trans>
          </SectionTitle>
          <Box
            className={styles.ButtonGroupTwoLines}
            gap={1}
            at={{
              small: {
                template: "auto / repeat(2, minmax(0, 1fr))",
              },
              tablet: {
                items: "normal stretch",
                template: "auto / repeat(4, 150px)",
                gap: 1,
              },
            }}
          >
            {Object.keys(languages).map((locale) => (
              <GroupButton
                key={locale}
                disabled={language === locale}
                onClick={() => changeLanguage(locale)}
                aria-label={`Select Language: ${
                  languages[locale as keyof typeof languages]
                }`}
                text={languages[locale as keyof typeof languages]}
              />
            ))}
          </Box>
        </Section>
        <Section>
          <SectionTitle>
            <Trans>Appearance</Trans>
          </SectionTitle>
          <Box
            flow="column"
            className={styles.ButtonGroupTwoLines}
            gap={1}
            at={{
              tablet: {
                items: "normal stretch",
                template: "auto / repeat(4, 150px)",
                gap: 1,
              },
            }}
          >
            <GroupButton
              disabled={mode === "light"}
              aria-pressed={mode === "light"}
              aria-label={t`Light Mode`}
              onClick={setLightMode}
              text={t`Light Mode`}
            />
            <GroupButton
              disabled={mode === "dark"}
              aria-pressed={mode === "dark"}
              aria-label={t`Dark Mode`}
              onClick={setDarkMode}
              text={t`Dark Mode`}
            />
          </Box>
        </Section>
        <Section className={styles.LowerLinks}>
          <SectionTitle as="a" href="https://tone-row.com">
            <Trans>
              Made by <strong>Tone Row</strong>
            </Trans>
          </SectionTitle>
          <Section at={lowerLinksAt}>
            <Type as="a" href="https://twitter.com/tone_row_" size={-1}>
              <Trans>Follow Us</Trans>
            </Type>
            <Type
              as="a"
              href="https://github.com/tone-row/flowchart-fun"
              size={-1}
            >
              <Trans>View on Github</Trans>
            </Type>
            <Type
              as="a"
              href="https://opencollective.com/tone-row/donate"
              size={-1}
              onClick={() => window.plausible("Make a Donation")}
            >
              <Trans>Make a Donation</Trans>
            </Type>
            <Type
              as="a"
              href="https://github.com/sponsors/tone-row"
              size={-1}
              onClick={() => window.plausible("Become a Sponsor")}
            >
              <Trans>Become a Sponsor</Trans>
            </Type>
          </Section>
        </Section>
      </Page>
    </Box>
  );
});

Settings.displayName = "Settings";

export default Settings;

const GroupButton = memo(({ children, className = "", ...props }: BoxProps) => {
  return (
    <Button className={[styles.GroupButton, className].join(" ")} {...props}>
      {children}
    </Button>
  );
});

GroupButton.displayName = "GroupButton";
