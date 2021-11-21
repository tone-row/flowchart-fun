import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { ReactNode, useContext, useEffect } from "react";

import { AppContext } from "./AppContext";

/**
 * We do a dynamic import of just the catalog that we need
 * @param locale any locale string
 */
async function dynamicActivate(locale: string) {
  const { messages } = await import(`../locales/${locale}/messages`);
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
