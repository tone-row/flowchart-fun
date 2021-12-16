/* eslint @typescript-eslint/no-empty-function: 0 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const gaEnabled = process.env.REACT_APP_ANALYTICS_ENABLED === "1";

// hook
let usePageViews = () => {};
// goals
let gaChangeGraphOption = (_: { action: string; label: string }) => {};
let gaChangeTab = (_: { action: string }) => {};
let gaSponsorCTA = (_: { action: string }) => {};
let gaCreateChart = (_: { action: string }) => {};
let gaExportChart = (_: { action: string; label: string }) => {};
let gaNewChart = () => {};
let gaCopyChart = () => {};

if (gaEnabled) {
  import("react-ga").then((ReactGA) => {
    ReactGA.initialize("UA-136783019-2");
    usePageViews = () => {
      const location = useLocation();
      useEffect(() => {
        ReactGA.pageview(location.pathname + location.search);
      }, [location.pathname, location.search]);
    };

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

    gaCopyChart = () => {
      ReactGA.event({
        category: "Home",
        action: "Copy Chart To New",
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
  gaCopyChart,
};
