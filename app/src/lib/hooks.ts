import { useContext, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";

import { AppContext } from "../components/AppContext";
import { slugify } from "./helpers";
import { useDocDetails } from "./useDoc";

/**
 * Returns whether animation has been disabled
 * via the query string ?animation=0
 */
export function getAnimationSettings() {
  const query = new URLSearchParams(window.location.search.slice(1));
  const animation = query.get("animation");
  return animation === "0" ? false : true;
}

export function useFullscreen() {
  const params = useParams();
  const { pathname } = useLocation();
  return pathname === "/f" || "public_id" in params;
}

export function useIsReadOnly() {
  const { pathname } = useLocation();
  const params = useParams();
  return (
    "public_id" in params || ["/f", "/c", "/r"].some((k) => k === pathname)
  );
}

export function useIsLocalChart() {
  const { pathname } = useLocation();
  return useMemo(() => pathname === "/", [pathname]);
}

export function useIsPublicHostedCharted() {
  const params = useParams();
  return useMemo(() => "public_id" in params, [params]);
}

/**
 * Get the supabase session
 */
export function useSession() {
  const { session } = useContext(AppContext);
  return session;
}

/** Use this to determine if the sponsor is valid.
 * That means their subscription is currently active.
 * i.e. They're in good standing, etc. */
export function useIsValidSponsor() {
  const { customer } = useContext(AppContext);
  return Boolean(customer?.subscription?.status === "active");
}

/**
 * Use this to determine if they are auth'd
 * Even if their payment is past due, they're still logged in.
 */
export function useIsValidCustomer() {
  const { customer } = useContext(AppContext);
  return Boolean(customer?.subscription);
}

/**
 * Returns the workspace title for a local chart
 * or the chart title slugified for a hosted chart
 */
export function useDownloadFilename() {
  const rawTitle = useDocDetails("title", "flowchart-fun");
  return slugify(rawTitle);
}

export function useIsFirefox() {
  const ua = window.navigator.userAgent;
  return ua.includes("Firefox");
}

/**
 * Returns whether showing the two-column editor view
 * Equivalent to the old "editor" tab
 * So it returns true for hosted and local charts, read only charts, and the help page
 *
 * It's used to alter CSS with data-showing
 */
export function useIsEditorView() {
  const pathname = useLocation().pathname;
  const params = useParams();

  return (
    // works for hosted and local charts
    ["id", "workspace"].some((k) => k in params) ||
    // works for read-only charts that aren't fullscreen
    ["/c", "/r", "/"].some((k) => pathname === k)
  );
}

export function useLightOrDarkMode() {
  return useContext(AppContext).mode;
}
