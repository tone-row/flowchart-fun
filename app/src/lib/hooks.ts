import { useContext, useMemo } from "react";
import { useLocation, useParams, useRouteMatch } from "react-router-dom";

import { AppContext } from "../components/AppContext";
import { useChart } from "./queries";

export function useAnimationSetting() {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const animation = query.get("animation");
  return animation === "0" ? false : true;
}

export function useFullscreen() {
  const { pathname } = useLocation();
  const { path } = useRouteMatch();
  return pathname === "/f" || path === "/p/:public_id";
}

export function useIsReadOnly() {
  const { path } = useRouteMatch();
  return (
    path === "/p/:public_id" ||
    path === "/f" ||
    path === "/c/:graphText?" ||
    path === "/r/:graphText?"
  );
}

export function useIsPublicHostedCharted() {
  const { path } = useRouteMatch();
  return useMemo(() => path === "/p/:public_id", [path]);
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

/** Get Chart Title for hosted or local chart */
export function useTitle(): [string, boolean, string] {
  const { workspace = "" } = useParams<{ workspace?: string }>();
  const { path, params } = useRouteMatch<{ id?: string }>();
  const id = params.id || ""; // setting fake ID for typescript
  const { data: chart } = useChart(id);
  if (path === "/u/:id" && chart) return [chart.name, true, id];
  return [workspace, false, id];
}

/**
 * Return a unique ID for any chart (local or hosted)
 * Hosted charts will return their database ID
 * Local charts will return their workspace name
 */
export function useChartId() {
  const { workspace = "_index" } = useParams<{ workspace?: string }>();
  const { path, params } = useRouteMatch<{ id?: string }>();
  const id = params.id || undefined;
  if (path === "/u/:id") return id;
  return workspace;
}

export function useCurrentHostedChart() {
  const { id } = useParams<{ id: string }>();
  return useChart(id);
}

export function useIsHelp() {
  const { path } = useRouteMatch();
  return path === "/h";
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
  const { path, isExact } = useRouteMatch();
  return (
    path === "/u/:id" ||
    path === "/c/:graphText?" ||
    path === "/r/:graphText?" ||
    path === "/h" ||
    path === "/:workspace" ||
    (path === "/" && isExact)
  );
}
