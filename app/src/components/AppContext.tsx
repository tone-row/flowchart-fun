import { Session } from "@supabase/gotrue-js";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import useLocalStorage from "react-use-localstorage";
import Stripe from "stripe";

import { LOCAL_STORAGE_SETTINGS_KEY } from "../lib/constants";
import { loadSponsorOnlyLayouts } from "../lib/cytoscape";
import { useCustomerInfo } from "../lib/queries";
import { useStoreGraph } from "../lib/store.graph";
import { supabase } from "../lib/supabaseClient";
import { languages } from "../locales/i18n";
import { colors, darkTheme } from "../slang/config";

type Theme = typeof colors;

export type Showing =
  | "navigation"
  | "editor"
  | "settings"
  | "feedback"
  | "sponsor";

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

export type TAppContext = {
  updateUserSettings: (newSettings: Partial<UserSettings>) => void;
  theme: Theme;
  shareLink: string;
  setShareLink: Dispatch<SetStateAction<string>>;
  language: string;
  showing: Showing;
  setShowing: Dispatch<SetStateAction<Showing>>;
  hasError: false | string;
  setHasError: Dispatch<SetStateAction<false | string>>;
  hasStyleError: false | string;
  setHasStyleError: Dispatch<SetStateAction<false | string>>;
  shareModal: boolean;
  setShareModal: Dispatch<SetStateAction<boolean>>;
  mobileEditorTab: mobileEditorTab;
  toggleMobileEditorTab: () => void;
  session: Session | null;
  customer?: CustomerInfo;
  customerIsLoading: boolean;
  checkedSession: boolean;
} & UserSettings;

type CustomerInfo = {
  customerId: string;
  subscription?: Stripe.Subscription;
};

export const AppContext = createContext({} as TAppContext);

const Provider = ({ children }: { children?: ReactNode }) => {
  const incrementGraphUpdateNumber = useStoreGraph(
    useCallback((store) => store.incrementGraphUpdateNumber, [])
  );
  const [showing, setShowing] = useState<Showing>("editor");
  const [shareLink, setShareLink] = useState("");
  const [shareModal, setShareModal] = useState(false);
  const [userSettingsString, setUserSettings] = useLocalStorage(
    LOCAL_STORAGE_SETTINGS_KEY,
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

  useEffect(() => {
    // Remove chart that may have been stored, so
    // two indexes aren't shown on charts page
    window.localStorage.removeItem("flowcharts.fun:");
  }, []);

  const [hasError, setHasError] = useState<TAppContext["hasError"]>(false);
  const [hasStyleError, setHasStyleError] =
    useState<TAppContext["hasStyleError"]>(false);

  // const [_, sponsorLayoutsLoaded] = useReducer(() => true, false);
  const [checkedSession, setCheckedSession] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  /* Load Sponsor-only layouts when logged in */
  useEffect(() => {
    if (session) {
      // setRunLayout(false);
      loadSponsorOnlyLayouts().then(() => {
        incrementGraphUpdateNumber();
        // trigger re-render with unused state, defer
        // setTimeout(() => sponsorLayoutsLoaded(), 0);
        // setRunLayout(true);
      });
    }
  }, [incrementGraphUpdateNumber, session]);

  useEffect(() => {
    if (supabase) {
      const session = supabase.auth.session();
      setSession(session);
      setCheckedSession(true);
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
    } else {
      setCheckedSession(true);
    }
  }, []);

  // Close Share Modal when navigating
  const { pathname } = useLocation();
  useEffect(() => setShareModal(false), [pathname]);

  const { data: customer, isFetching: customerIsLoading } = useCustomerInfo(
    session?.user?.email
  );

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
        customer,
        customerIsLoading,
        hasStyleError,
        setHasStyleError,
        ...settings,
        language: settings.language ?? defaultLanguage,
        checkedSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default Provider;

export function useSession() {
  return useContext(AppContext).session;
}
