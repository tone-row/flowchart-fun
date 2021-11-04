import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const gaEnabled = process.env.REACT_APP_ANALYTICS_ENABLED === "1";

// eslint-disable-next-line @typescript-eslint/no-empty-function
let usePageViews = () => {};

if (gaEnabled) {
  import("react-ga").then((ReactGA) => {
    ReactGA.initialize("UA-136783019-2");
    usePageViews = () => {
      const location = useLocation();
      useEffect(() => {
        ReactGA.pageview(location.pathname + location.search);
      }, [location.pathname, location.search]);
    };
  });
}

export { usePageViews };
