import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Historically, /n# and /n/ were used to
 * create new charts from a template.
 *
 * That has been changed to #load once new charts were only
 * created in the sandbox.
 *
 * This hook redirects all /n# and /n/ to #load:
 */
export function useSupportLegacyNRoute() {
  const navigate = useNavigate();
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.pathname === "/n" && url.hash) {
      navigate(`/#load:${url.hash.slice(1)}`);
    } else if (url.pathname.startsWith("/n/")) {
      const graphText = url.pathname.slice(3);
      navigate(`/#load:${graphText}`);
    }
  }, [navigate]);
}
