import { decompressFromEncodedURIComponent as decompress } from "lz-string";
import { useContext, useMemo } from "react";
import { useLocation, useParams, useRouteMatch } from "react-router-dom";

import { AppContext } from "../components/AppContext";
import { HIDDEN_GRAPH_OPTIONS_DIVIDER } from "./constants";
import { HiddenGraphOptions } from "./helpers";
import { useChart, usePublicChart } from "./queries";

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
  const isCompressed = [
    "/c/:graphText?",
    "/f/:graphText?",
    "/n/:graphText?",
  ].includes(path);
  const { graphText = window.location.hash.slice(1) } = useParams<{
    graphText: string;
  }>();
  if (path === "/p/:public_id") {
    return getTextAndHiddenGraphOptions(data.chart ?? "");
  }

  const fullText = isCompressed
    ? decompress(graphText) ?? ""
    : decodeURIComponent(graphText);

  return getTextAndHiddenGraphOptions(fullText);

  function getTextAndHiddenGraphOptions(fullText: string) {
    let text = fullText,
      hiddenGraphOptions: HiddenGraphOptions = {};

    if (fullText.includes(HIDDEN_GRAPH_OPTIONS_DIVIDER)) {
      const [_text, hiddenGraphOptionsText] = fullText.split(
        HIDDEN_GRAPH_OPTIONS_DIVIDER
      );
      text = _text;
      try {
        hiddenGraphOptions = JSON.parse(hiddenGraphOptionsText.trim());
      } catch (e) {
        console.log(e);
      }
    }
    return { text, hiddenGraphOptions, fullText };
  }
}

export function useIsHelp() {
  const { path } = useRouteMatch();
  return path === "/h";
}

export function useIsFirefox() {
  const ua = window.navigator.userAgent;
  return ua.includes("Firefox");
}
