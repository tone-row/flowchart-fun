import { t, Trans } from "@lingui/macro";
import { memo, useCallback, useContext } from "react";
import { Link } from "react-router-dom";

import { languages } from "../locales/i18n";
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
      <div className="bg-white rounded-lg border border-neutral-200/60 dark:bg-neutral-900 dark:border-neutral-800 p-8 md:p-10">
        <div className="grid gap-10">
          <Section>
            <SectionTitle>
              <Trans>Language</Trans>
            </SectionTitle>
            <div className="grid gap-1 sm:grid-cols-2 md:grid-cols-4">
              {Object.keys(languages).map((locale) => (
                <GroupButton
                  key={locale}
                  isActive={language === locale}
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
            <div className="flex gap-1">
              <GroupButton
                isActive={mode === "light"}
                disabled={mode === "light"}
                aria-pressed={mode === "light"}
                aria-label={t`Light Mode`}
                onClick={setLightMode}
              >
                <Trans>Light Mode</Trans>
              </GroupButton>
              <GroupButton
                isActive={mode === "dark"}
                disabled={mode === "dark"}
                aria-pressed={mode === "dark"}
                aria-label={t`Dark Mode`}
                onClick={setDarkMode}
              >
                <Trans>Dark Mode</Trans>
              </GroupButton>
            </div>
          </Section>
          <Section className={styles.LowerLinks}>
            <SectionTitle>
              <Trans>About</Trans>
            </SectionTitle>
            <p className="text-sm md:text-base md:leading-normal">
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
            <div className="grid gap-3">
              <a
                href={DISCORD_URL}
                className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 transition-colors"
              >
                Discord
              </a>
              <a
                href="https://github.com/tone-row/flowchart-fun"
                className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 transition-colors"
              >
                <Trans>View on Github</Trans>
              </a>
              <a
                href="https://twitter.com/tone_row_"
                className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 transition-colors"
              >
                <Trans>Follow Us on Twitter</Trans>
              </a>
              <Link
                to="/privacy-policy"
                className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 transition-colors"
              >
                <Trans>Privacy Policy</Trans>
              </Link>
              <Link
                to="/cookie-policy"
                className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 transition-colors"
              >
                <Trans>Cookie Policy</Trans>
              </Link>
            </div>
          </Section>
          <Section>
            <SectionTitle>
              <Trans>Support</Trans>
            </SectionTitle>
            <p className="text-sm md:text-base md:leading-normal text-neutral-600 dark:text-neutral-400">
              <Trans>
                Flowchart Fun is built and maintained by one developer. Your
                support keeps it going.
              </Trans>
            </p>
            <div className="grid gap-3">
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center rounded-md border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-4 py-2 text-sm font-medium transition-colors w-fit"
              >
                <Trans>Become a Pro User</Trans>
              </Link>
              <a
                href="https://opencollective.com/tone-row/donate"
                className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 transition-colors"
              >
                <Trans>Make a One-Time Donation</Trans>
              </a>
              <a
                href="https://github.com/sponsors/tone-row"
                className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 transition-colors"
              >
                <Trans>Become a Github Sponsor</Trans>
              </a>
            </div>
          </Section>
        </div>
      </div>
    </Page>
  );
});

Settings.displayName = "Settings";

export default Settings;

const GroupButton = memo(
  ({
    children,
    className = "",
    isActive,
    ...props
  }: Parameters<typeof Button2>[0] & { isActive?: boolean }) => {
    return (
      <Button2
        className={[
          styles.GroupButton,
          isActive
            ? "!bg-[#2563eb] !text-white !opacity-100 !cursor-default"
            : "!bg-neutral-100 !text-neutral-600 hover:!bg-neutral-200 dark:!bg-neutral-800 dark:!text-neutral-400 dark:hover:!bg-neutral-700",
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </Button2>
    );
  }
);

GroupButton.displayName = "GroupButton";
