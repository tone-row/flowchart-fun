import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import useLocalStorage from "react-use-localstorage";
import { languages } from "../locales/i18n";
import { colors, darkTheme } from "../slang/config";
import { FlagsProvider } from "flagged";
import { Session } from "@supabase/gotrue-js";
import { supabase } from "../supabaseClient";

type Theme = typeof colors;

export type Showing =
  | "navigation"
  | "editor"
  | "settings"
  | "share"
  | "feedback"
  | "login";

// Stored in localStorage
export type UserSettings = {
  mode: "light" | "dark";
  language?: string;
};

// Get default languages
const browserLanguage = navigator.language.slice(0, 2);
const defaultLanguage = Object.keys(languages).includes(browserLanguage)
  ? browserLanguage
  : "en";

type mobileEditorTab = "text" | "graph";

type TAppContext = {
  updateUserSettings: (newSettings: Partial<UserSettings>) => void;
  theme: Theme;
  shareLink: string;
  setShareLink: Dispatch<SetStateAction<string>>;
  language: string;
  showing: Showing;
  setShowing: Dispatch<SetStateAction<Showing>>;
  hasError: boolean;
  setHasError: Dispatch<SetStateAction<boolean>>;
  shareModal: boolean;
  setShareModal: Dispatch<SetStateAction<boolean>>;
  mobileEditorTab: mobileEditorTab;
  toggleMobileEditorTab: () => void;
  session: Session | null;
} & UserSettings;

export const AppContext = createContext({} as TAppContext);

const Provider = ({ children }: { children?: ReactNode }) => {
  const [showing, setShowing] = useState<Showing>("editor");
  const [shareLink, setShareLink] = useState("");
  const [shareModal, setShareModal] = useState(false);
  const [userSettingsString, setUserSettings] = useLocalStorage(
    "flowcharts.fun.user.settings",
    "{}"
  );
  const [mobileEditorTab, setMobileEditorTab] =
    useState<mobileEditorTab>("text");
  const toggleMobileEditorTab = useCallback(
    () =>
      setMobileEditorTab((currentTab) =>
        currentTab === "text" ? "graph" : "text"
      ),
    []
  );
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

  const [flags, setFeatures] = useState([]);

  useEffect(() => {
    // Remove chart that may have been stored, so
    // two indexes aren't shown on charts page
    window.localStorage.removeItem("flowcharts.fun:");
  }, []);

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    (async function () {
      const response = await fetch("/api/feature", {
        mode: "cors",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
      });
      const features = await response.json();
      setFeatures(features);
    })();
  }, []);

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(supabase.auth.session());
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        theme,
        shareLink,
        setShareLink,
        updateUserSettings,
        showing,
        setShowing,
        hasError,
        setHasError,
        setShareModal,
        shareModal,
        mobileEditorTab,
        toggleMobileEditorTab,
        session,
        ...settings,
        language: settings.language ?? defaultLanguage,
      }}
    >
      <FlagsProvider features={flags}>{children}</FlagsProvider>
    </AppContext.Provider>
  );
};

export default Provider;
