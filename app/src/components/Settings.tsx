import { t, Trans } from "@lingui/macro";
import { memo, useCallback, useContext } from "react";
import { Link } from "react-router-dom";

import { languages } from "../locales/i18n";
import { Box } from "../slang";
import { Button2, Page, Section } from "../ui/Shared";
import { PageTitle, SectionTitle } from "../ui/Typography";
import { AppContext } from "./AppContextProvider";
import styles from "./Settings.module.css";
import { DISCORD_URL } from "../lib/constants";

const Settings = memo(() => {
  const { updateUserSettings, mode, language } = useContext(AppContext);
  const setLightMode = useCallback(() => {
    document.body.classList.add("disableAnimation");
    updateUserSettings({ mode: "light" });
    setTimeout(() => document.body.classList.remove("disableAnimation"), 100);
  }, [updateUserSettings]);
  const setDarkMode = useCallback(() => {
    document.body.classList.add("disableAnimation");
    updateUserSettings({ mode: "dark" });
    setTimeout(() => document.body.classList.remove("disableAnimation"), 100);
  }, [updateUserSettings]);
  const changeLanguage = useCallback(
    (l: string) => {
      updateUserSettings({ language: l });
    },
    [updateUserSettings]
  );

  return (
    <Page>
      <PageTitle className="text-center w-full">
        <Trans>Settings</Trans>
      </PageTitle>
      <Section>
        <SectionTitle>
          <Trans>Language</Trans>
        </SectionTitle>
        <div className="grid gap-1 sm:grid-cols-2 md:grid-cols-4">
          {Object.keys(languages).map((locale) => (
            <GroupButton
              key={locale}
              disabled={language === locale}
              onClick={() => changeLanguage(locale)}
              aria-label={`Select Language: ${
                languages[locale as keyof typeof languages]
              }`}
            >
              {languages[locale as keyof typeof languages]}
            </GroupButton>
          ))}
        </div>
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
          >
            <Trans>Light Mode</Trans>
          </GroupButton>
          <GroupButton
            disabled={mode === "dark"}
            aria-pressed={mode === "dark"}
            aria-label={t`Dark Mode`}
            onClick={setDarkMode}
          >
            <Trans>Dark Mode</Trans>
          </GroupButton>
        </Box>
      </Section>
      <Section className={styles.LowerLinks}>
        <SectionTitle>
          <Trans>About</Trans>
        </SectionTitle>
        <p className="text-sm md:text-base md:leading-normal">
          <Trans>
            <span>Flowchart Fun</span> is an open source project made by{" "}
            <a href="https://tone-row.com" className="font-bold text-blue-500">
              Tone&nbsp;Row
            </a>
          </Trans>
        </p>
        <Section>
          <a
            href={DISCORD_URL}
            className="text-xs opacity-60 hover:opacity-100"
          >
            Discord
          </a>
          <a
            href="https://github.com/tone-row/flowchart-fun"
            className="text-xs opacity-60 hover:opacity-100"
          >
            <Trans>View on Github</Trans>
          </a>
          <a
            href="https://twitter.com/tone_row_"
            className="text-xs opacity-60 hover:opacity-100"
          >
            <Trans>Follow Us on Twitter</Trans>
          </a>
          <Link
            to="/privacy-policy"
            className="text-xs opacity-60 hover:opacity-100"
          >
            <Trans>Privacy Policy</Trans>
          </Link>
          <Link
            to="/cookie-policy"
            className="text-xs opacity-60 hover:opacity-100"
          >
            <Trans>Cookie Policy</Trans>
          </Link>
        </Section>
      </Section>
      <Section>
        <SectionTitle>Support</SectionTitle>
        <p className="text-sm md:text-base md:leading-normal">
          <Trans>
            If you enjoy using <span>Flowchart Fun</span>, please consider
            supporting the project
          </Trans>
        </p>
        <Section>
          <Link to="/pricing" className="text-xs opacity-60 hover:opacity-100">
            <Trans>Become a Pro User</Trans>
          </Link>
          <a
            href="https://opencollective.com/tone-row/donate"
            className="text-xs opacity-60 hover:opacity-100"
          >
            <Trans>Make a One-Time Donation</Trans>
          </a>
          <a
            href="https://github.com/sponsors/tone-row"
            className="text-xs opacity-60 hover:opacity-100"
          >
            <Trans>Become a Github Sponsor</Trans>
          </a>
        </Section>
      </Section>
    </Page>
  );
});

Settings.displayName = "Settings";

export default Settings;

const GroupButton = memo(
  ({ children, className = "", ...props }: Parameters<typeof Button2>[0]) => {
    return (
      <Button2 className={[styles.GroupButton, className].join(" ")} {...props}>
        {children}
      </Button2>
    );
  }
);

GroupButton.displayName = "GroupButton";
