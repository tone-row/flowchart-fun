import { Session } from "@supabase/supabase-js";
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
import { useCustomerInfo, useHostedCharts } from "../lib/queries";
import { languages } from "../locales/i18n";
import { colors, darkTheme } from "../slang/config";
import { supabase } from "../lib/supabaseClient";
import { usePostHog } from "posthog-js/react";

type Theme = typeof colors;

// Stored in localStorage
export type UserSettings = {
  mode: "light" | "dark";
  language?: string;
};

const isProd = process.env.REACT_APP_VERCEL_ENV === "production";

// Get default languages
const browserLanguage = navigator.language.slice(0, 2);
const defaultLanguage = Object.keys(languages).includes(browserLanguage)
  ? browserLanguage
  : "en";

type TAppContext = {
  updateUserSettings: (newSettings: Partial<UserSettings>) => void;
  theme: Theme;
  language: string;
  shareModal: boolean;
  setShareModal: Dispatch<SetStateAction<boolean>>;
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

  // Close Share Modal when navigating
  const { pathname } = useLocation();
  useEffect(() => {
    setShareModal(false);
  }, [pathname]);

  const { data: customer, isFetching: customerIsLoading } = useCustomerInfo();

  // Load hosted charts ahead of time
  useHostedCharts(session?.user?.id);

  // add class "dark" to body if dark mode
  useEffect(() => {
    if (settings.mode === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [settings.mode]);

  // Accurate Page Views
  const posthog = usePostHog();
  useEffect(() => {
    if (!posthog || !isProd) return;
    posthog.capture("$pageview");
  }, [posthog, pathname]);

  // ID
  const email = session?.user?.email ?? "";
  useEffect(() => {
    if (!posthog || !email || !isProd) return;
    posthog.identify(email);
  }, [posthog, email]);

  // Get Session
  useEffect(() => {
    requestAnimationFrame(() => {
      // If we're not logged in, don't bother checking
      if (!supabase) {
        setCheckedSession(true);
        return;
      }

      (async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setCheckedSession(true);
        supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);

          // Reset PostHog if we're logged out
          if (posthog && !session && isProd) {
            posthog.reset();
          }
        });
      })();
    });
  }, [posthog]);

  return (
    <AppContext.Provider
      value={{
        theme,
        updateUserSettings,
        setShareModal,
        shareModal,
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
