import { i18n } from "@lingui/core";
import { ReactNode, useContext, useEffect } from "react";
import { I18nProvider } from "@lingui/react";
import { AppContext } from "../components/AppContext";

export const defaultLocale = "en";
export const languages = {
  de: "Deutsche",
  en: "English",
  fr: "Français",
  hi: "हिन्दी",
  ko: "조선말",
  zh: "中文",
};

/**
 * We do a dynamic import of just the catalog that we need
 * @param locale any locale string
 */
export async function dynamicActivate(locale: string) {
  const { messages } = await import(`./${locale}/messages`);
  i18n.load(locale, messages);
  i18n.activate(locale);
}

export const I18n = ({ children }: { children: ReactNode }) => {
  const { language } = useContext(AppContext);
  useEffect(() => {
    // With this method we dynamically load the catalogs
    dynamicActivate(language);
  }, [language]);

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
};
