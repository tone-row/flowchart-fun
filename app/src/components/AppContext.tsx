import {
  createContext,
  Dispatch,
  DispatchWithoutAction,
  ReactNode,
  SetStateAction,
  useCallback,
  useMemo,
  useReducer,
  useState,
} from "react";
import useLocalStorage from "react-use-localstorage";
import { colors, darkTheme } from "../slang/config";

type Theme = typeof colors;

// Stored in localStorage
type UserSettings = {
  mode: "light" | "dark";
};

export const AppContext = createContext({ setIsReady: () => {} } as {
  isReady: boolean;
  setIsReady: DispatchWithoutAction;
  updateUserSettings: (newSettings: Partial<UserSettings>) => void;
  theme: Theme;
  shareLink: string;
  setShareLink: Dispatch<SetStateAction<string>>;
} & Partial<UserSettings>);

const Provider = ({ children }: { children?: ReactNode }) => {
  const [isReady, setIsReady] = useReducer(() => true, false);
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

  return (
    <AppContext.Provider
      value={{
        isReady,
        setIsReady,
        updateUserSettings,
        theme,
        shareLink,
        setShareLink,
        ...settings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default Provider;
