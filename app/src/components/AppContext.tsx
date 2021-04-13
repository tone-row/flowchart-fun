import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import useLocalStorage from "react-use-localstorage";
import { colors, darkTheme } from "../slang/config";

type Theme = typeof colors;

// Stored in localStorage
type UserSettings = {
  mode: "light" | "dark";
};

type TAppContext = {
  updateUserSettings: (newSettings: Partial<UserSettings>) => void;
  theme: Theme;
  shareLink: string;
  setShareLink: Dispatch<SetStateAction<string>>;
} & Partial<UserSettings>;

export const AppContext = createContext({} as TAppContext);

const Provider = ({ children }: { children?: ReactNode }) => {
  const [shareLink, setShareLink] = useState("");
  const [userSettingsString, setUserSettings] = useLocalStorage(
    "flowcharts.fun.user.settings",
    "{}"
  );
  let { settings, theme } = useMemo<{
    settings: Partial<UserSettings>;
    theme: Theme;
  }>(() => {
    try {
      const settings = JSON.parse(userSettingsString);
      const theme =
        settings.mode === "dark"
          ? darkTheme
          : typeof settings.mode === "undefined" &&
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
          ? darkTheme
          : colors;
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

  return (
    <AppContext.Provider
      value={{
        theme,
        shareLink,
        setShareLink,
        updateUserSettings,
        ...settings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default Provider;
