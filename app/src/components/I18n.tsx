import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { de, en, fr, hi, ko, pt, zh, es } from "make-plural/plurals";
import { ReactNode, useContext, useEffect } from "react";

import { messages as enMessages } from "../locales/en/messages";

i18n.loadLocaleData("en", { plurals: en });
i18n.loadLocaleData("fr", { plurals: fr });
i18n.loadLocaleData("zh", { plurals: zh });
i18n.loadLocaleData("ko", { plurals: ko });
i18n.loadLocaleData("de", { plurals: de });
i18n.loadLocaleData("hi", { plurals: hi });
i18n.loadLocaleData("pt-br", { plurals: pt });
i18n.loadLocaleData("es", { plurals: es });

import { AppContext } from "./AppContext";

i18n.load({ en: enMessages });
i18n.activate("en");

/**
 * We do a dynamic import of just the catalog that we need
 * @param locale any locale string
 */
async function dynamicActivate(locale: string) {
  const { messages } = await import(`../locales/${locale}/messages`);
  i18n.load({ [locale]: messages });
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
