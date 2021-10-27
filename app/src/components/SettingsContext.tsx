import { createContext, ReactNode } from "react";
import { languages } from "../locales/i18n";

export type UserSettings = {
  mode: "light" | "dark";
  language?: string;
};

// Get default languages
const browserLanguage = navigator.language.slice(0, 2);
const defaultLanguage = Object.keys(languages).includes(browserLanguage)
  ? browserLanguage
  : "en";

const defaultUserSettingsCtx: UserSettings = {
  language: defaultLanguage,
  mode:
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
};

const UserSettingsContext = createContext<UserSettings>(defaultUserSettingsCtx);

/*


const { settings, theme } = useMemo<{
    settings: UserSettings;
    theme: Theme;
  }>(() => {
    try {
      const settings = JSON.parse(userSettingsString);
      if (typeof settings.mode === "undefined") {
        settings.mode =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
      }
      const theme = settings.mode === "dark" ? darkTheme : colors;

      return { settings, theme };
    } catch (e) {
      console.error(e);
      return { settings: {}, theme: colors };
    }
  }, [userSettingsString]);


const updateUserSettings = useCallback(
    (newSettings: Partial<UserSettings>) => {
      setUserSettings(JSON.stringify({ ...settings, ...newSettings }));
    },
    [setUserSettings, settings]
  );
*/

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const iframe = isIframe();
  console.log({ iframe });
  return (
    <UserSettingsContext.Provider value={defaultUserSettingsCtx}>
      {children}
    </UserSettingsContext.Provider>
  );
}

function isIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}
