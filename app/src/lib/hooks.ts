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
  const params = useParams();
  return useMemo(
    () => pathname === "/" || "workspace" in params,
    [params, pathname]
  );
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
export function useIsProUser() {
  const { customer } = useContext(AppContext);
  const status = customer?.subscription?.status;
  return Boolean(status === "active");
}

/**
 * Use this to determine if they were a pro user
 */
export function useWasProUser() {
  const { customer } = useContext(AppContext);
  const status = customer?.subscription?.status;
  return status && ["canceled", "past_due", "unpaid"].includes(status);
}

/**
 * Use this to determine if they are auth'd
 * Even if their payment is past due, they're still logged in.
 */
export function useIsValidCustomer() {
  const { customer } = useContext(AppContext);
  return Boolean(customer?.subscription);
}

export function useIsLoggedIn() {
  const { session } = useContext(AppContext);
  return Boolean(session);
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

/**
 * Used all throughout the Edit page to determine if the user is allowed to update the graph.
 */
export function useCanEdit() {
  // you can edit if you're on the index page (scratch pad) or you are a pro user
  // this may need to be tweaked when sharing charts becomes a thing
  const isLocalChart = useIsLocalChart();
  const isProUser = useIsProUser();
  return isLocalChart || isProUser;
}
