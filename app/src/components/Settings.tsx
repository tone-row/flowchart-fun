import { t, Trans } from "@lingui/macro";
import { memo, useCallback, useContext } from "react";
import { Link } from "react-router-dom";

import { languages } from "../locales/i18n";
import { Box, BoxProps } from "../slang";
import { Button, Page, Section } from "../ui/Shared";
import { PageTitle, SectionTitle } from "../ui/Typography";
import { AppContext } from "./AppContext";
import styles from "./Settings.module.css";

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
    <Box px={4} pb={4} pt={8} className={styles.Settings}>
      <Page
        content="start normal"
        at={{ tablet: { items: "start", content: "start", gap: 14 } }}
      >
        <PageTitle>
          <Trans>Settings</Trans>
        </PageTitle>
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
          <SectionTitle>
            <Trans>About</Trans>
          </SectionTitle>
          <p className="text-sm md:text-base leading-normal">
            <Trans>
              <span>Flowchart Fun</span> is an open source project made by{" "}
              <a
                href="https://tone-row.com"
                className="font-bold text-blue-500"
              >
                Tone&nbsp;Row
              </a>
            </Trans>
          </p>
          <Section>
            <a
              href="https://github.com/tone-row/flowchart-fun"
              className="text-sm opacity-60 hover:opacity-100"
            >
              <Trans>View on Github</Trans>
            </a>
            <a
              href="https://twitter.com/tone_row_"
              className="text-sm opacity-60 hover:opacity-100"
            >
              <Trans>Follow Us on Twitter</Trans>
            </a>
          </Section>
        </Section>
        <Section>
          <SectionTitle>Support</SectionTitle>
          <p className="text-sm md:text-base leading-normal">
            <Trans>
              If you enjoy using <span>Flowchart Fun</span>, please consider
              supporting the project
            </Trans>
          </p>
          <Section>
            <Link
              to="/pricing"
              className="text-sm opacity-60 hover:opacity-100"
            >
              <Trans>Become a Pro User</Trans>
            </Link>
            <a
              href="https://opencollective.com/tone-row/donate"
              className="text-sm opacity-60 hover:opacity-100"
            >
              <Trans>Make a One-Time Donation</Trans>
            </a>
            <a
              href="https://github.com/sponsors/tone-row"
              className="text-sm opacity-60 hover:opacity-100"
            >
              <Trans>Become a Github Sponsor</Trans>
            </a>
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
