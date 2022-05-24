import { t } from "@lingui/macro";
import { decompressFromEncodedURIComponent as decompress } from "lz-string";
import { Dispatch, useContext, useMemo } from "react";
import { useLocation, useParams, useRouteMatch } from "react-router-dom";
import useLocalStorage from "react-use-localstorage";

import { AppContext } from "../components/AppContext";
import { useChart, usePublicChart } from "./queries";

export function useAnimationSetting() {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const animation = query.get("animation");
  return animation === "0" ? false : true;
}

export function useLocalStorageText(
  defaultWorkspace = ""
): [string, Dispatch<string>, string] {
  const { workspace = defaultWorkspace } = useParams<{ workspace?: string }>();
  const defaultText = `${t`This app works by typing`}
  ${t`Indenting creates a link to the current line`}
  ${t`any text: before a colon creates a label`}
  ${t`Create a link directly using the exact label text`}
    ${t`like this: (This app works by typing)`}
    ${t`[custom ID] or`}
      ${t`by adding an %5BID%5D and referencing that`}
        ${t`like this: (custom ID) // You can also use single-line comments`}
/*
${t`or`}
${t`multiline`}
${t`comments`}

${t`Have fun! 🎉`}
*/`;
  const [text, setText] = useLocalStorage(
    ["flowcharts.fun", workspace].filter(Boolean).join(":"),
    defaultText
  );
  return [text, setText, defaultText];
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

export function useIsValidSponsor() {
  const { customer } = useContext(AppContext);
  return Boolean(customer?.subscription?.status === "active");
}

export function useIsValidCustomer() {
  const { customer } = useContext(AppContext);
  return Boolean(customer?.subscription);
}

export function useTitle(): [string, boolean, string | undefined] {
  const { workspace = "" } = useParams<{ workspace?: string }>();
  const { path, params } = useRouteMatch<{ id?: string }>();
  const id = params.id || undefined;
  const { data: chart } = useChart(id);
  if (path === "/u/:id" && chart) return [chart.name, true, id];
  return [workspace, false, undefined];
}

export function useCurrentHostedChart() {
  const { id } = useParams<{ id?: string }>();
  return useChart(id);
}

/** Returns the graph text in the hash for read-only routes */
export function useReadOnlyText() {
  const { public_id = "" } = useParams<{ public_id: string }>();
  const { data } = usePublicChart(public_id);
  const { path } = useRouteMatch();
  const isCompressed = ["/c/:graphText?", "/f/:graphText?"].includes(path);
  const { graphText = window.location.hash.slice(1) } = useParams<{
    graphText: string;
  }>();
  if (path === "/p/:public_id") return data.chart ?? "";
  return isCompressed
    ? decompress(graphText) ?? ""
    : decodeURIComponent(graphText);
}

export function useIsHelp() {
  const { path } = useRouteMatch();
  return path === "/h";
}

export function useIsFirefox() {
  const ua = window.navigator.userAgent;
  return ua.includes("Firefox");
}
