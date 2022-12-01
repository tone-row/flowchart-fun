/* eslint @typescript-eslint/no-empty-function: 0 */
import { useEffect } from "react";
import TagManager from "react-gtm-module";
import { useLocation } from "react-router-dom";

const gaEnabled = process.env.REACT_APP_ANALYTICS_ENABLED === "1";
const gtmId = process.env.REACT_APP_GTM_ID ?? "";

// hook
let usePageViews = () => {};

// goals
let gaChangeGraphOption = (_: { action: string; label: string }) => {};
let gaChangeTab = (_: { action: string }) => {};
let gaSponsorCTA = (_: { action: string }) => {};
let gaCreateChart = (_: { action: string }) => {};
let gaExportChart = (_: { action: string; label: string }) => {};
let gaNewChart = () => {};
let gaUseGraphContextMenu = (_: { action: string }) => {};
let gaJumpToSponsorPage = (_: { action: string }) => {};

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

  import("react-ga").then((ReactGA) => {
    ReactGA.initialize("UA-136783019-2");

    gaChangeGraphOption = ({ label, action }) => {
      ReactGA.event({
        category: "Change Graph Options",
        action,
        label,
      });
    };

    gaChangeTab = ({ action }) => {
      ReactGA.event({
        category: "Change Tab",
        action,
      });
    };

    gaSponsorCTA = ({ action }) => {
      ReactGA.event({
        category: "Sponsor CTA",
        action,
      });
    };

    gaCreateChart = ({ action }) => {
      ReactGA.event({
        category: "Create Chart",
        action,
      });
    };

    gaExportChart = ({ action, label }) => {
      ReactGA.event({
        category: "Export Chart",
        action,
        label,
      });
    };

    gaNewChart = () => {
      ReactGA.event({
        category: "Home",
        action: "New Chart",
      });
    };

    gaUseGraphContextMenu = ({ action }) => {
      ReactGA.event({
        category: "Graph Context Menu",
        action: action,
      });
    };

    gaJumpToSponsorPage = ({ action }) => {
      ReactGA.event({
        category: "Jump to Sponsor Page",
        action,
      });
    };
  });
}

export {
  usePageViews,
  gaChangeGraphOption,
  gaChangeTab,
  gaSponsorCTA,
  gaCreateChart,
  gaExportChart,
  gaNewChart,
  gaUseGraphContextMenu,
  gaJumpToSponsorPage,
};
