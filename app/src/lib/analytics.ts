/* eslint @typescript-eslint/no-empty-function: 0 */
import { useEffect } from "react";
import TagManager from "react-gtm-module";
import { useLocation } from "react-router-dom";

const gaEnabled = process.env.REACT_APP_ANALYTICS_ENABLED === "1";
const gtmId = process.env.REACT_APP_GTM_ID ?? "";

// hook
let usePageViews = () => {};

declare global {
  interface Window {
    dataLayer: any[];
  }
}

if (gaEnabled && gtmId) {
  TagManager.initialize({ gtmId });
  usePageViews = () => {
    const location = useLocation();
    useEffect(() => {
      window.dataLayer.push({
        event: "pageview",
        page: { url: location.pathname },
      });
    }, [location.pathname, location.search]);
  };
}

export { usePageViews };
