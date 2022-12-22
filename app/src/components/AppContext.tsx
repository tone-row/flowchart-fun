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
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import useLocalStorage from "react-use-localstorage";
import Stripe from "stripe";

import { LOCAL_STORAGE_SETTINGS_KEY } from "../lib/constants";
import { loadSponsorOnlyLayouts } from "../lib/cytoscape";
import { useCustomerInfo, useHostedCharts } from "../lib/queries";
import { supabase } from "../lib/supabaseClient";
import { useGraphStore } from "../lib/useGraphStore";
import { languages } from "../locales/i18n";
import { colors, darkTheme } from "../slang/config";

type Theme = typeof colors;

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
  language: string;
  shareModal: boolean;
  setShareModal: Dispatch<SetStateAction<boolean>>;
  mobileEditorTab: mobileEditorTab;
  toggleMobileEditorTab: () => void;
  session: Session | null;
  customer?: CustomerInfo;
  customerIsLoading: boolean;
  /** Whether or not we've finished discovering if the user is auth'd */
  checkedSession: boolean;
} & UserSettings;

type CustomerInfo = {
  customerId: string;
  subscription?: Stripe.Subscription;
};

export const AppContext = createContext({} as TAppContext);

const Provider = ({ children }: { children?: ReactNode }) => {
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

  const [checkedSession, setCheckedSession] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const sponsorLayoutsLoading = useRef(false);

  /* Load Sponsor-only layouts when logged in */
  useEffect(() => {
    // If not logged in, return
    if (!session) return;
    // If already loaded, return
    if (useGraphStore.getState().sponsorLayoutsLoaded) return;
    // If in the process of loading, return
    if (sponsorLayoutsLoading.current) return;
    sponsorLayoutsLoading.current = true;
    loadSponsorOnlyLayouts().then(() => {
      useGraphStore.setState({ sponsorLayoutsLoaded: true });
    });
  }, [session]);

  useEffect(() => {
    if (supabase) {
      (async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setCheckedSession(true);
        supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
        });
      })();
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

  // Load hosted charts ahead of time
  useHostedCharts(session?.user?.id);

  return (
    <AppContext.Provider
      value={{
        theme,
        updateUserSettings,
        setShareModal,
        shareModal,
        mobileEditorTab,
        toggleMobileEditorTab,
        session,
        customer,
        customerIsLoading,
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
