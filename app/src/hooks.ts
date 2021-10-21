import { t } from "@lingui/macro";
import { Dispatch, useCallback, useContext } from "react";
import { useLocation, useParams, useRouteMatch } from "react-router-dom";
import useLocalStorage from "react-use-localstorage";
import { AppContext } from "./components/AppContext";
import { GraphContext } from "./components/GraphProvider";
import { allGraphThemes, defaultGraphTheme } from "./components/graphThemes";
import { useChart } from "./lib/queries";

export function useAnimationSetting() {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const animation = query.get("animation");
  return animation === "0" ? false : true;
}

export function useLocalStorageText(): [string, Dispatch<string>, string] {
  const { workspace = "" } = useParams<{ workspace?: string }>();
  const defaultText = `${t`This app works by typing`}
  ${t`Indenting creates a link to the current line`}
  ${t`any text: before a colon creates a label`}
  ${t`Create a link directly using the exact label text`}
    ${t`like this: (This app works by typing)`}
    ${t`[custom ID] or`}
      ${t`by adding an [ID] and referencing that`}
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
  return pathname === "/f";
}

export function useGraphTheme() {
  const { graphOptions } = useContext(GraphContext);
  return (
    (graphOptions &&
      graphOptions.theme &&
      allGraphThemes.includes(graphOptions.theme) &&
      graphOptions.theme) ||
    defaultGraphTheme
  );
}

const base = 12.5;
const defaultMinWidth = 8;
const defaultMinHeight = 6;

// returns getSize based on theme to determine node size
export function useGetSize(
  minWidth = defaultMinWidth,
  minHeight = defaultMinHeight
) {
  const getSize = useCallback(
    (label: string) => {
      const resizer = document.getElementById("resizer");
      if (resizer) {
        // TODO: Widen boxes as box height climbs
        // resizer.style.width = "128px";
        // const initialHeight = resizer.clientHeight;
        // const add = Math.max(0, Math.ceil((initialHeight - 150) / 50)) * 8;
        // resizer.style.width = `${128 + add}px`;
        resizer.innerHTML = preventCyRenderingBugs(label);
        if (resizer.firstChild) {
          const range = document.createRange();
          range.selectNodeContents(resizer.firstChild);
          const width = Array.from(range.getClientRects()).reduce(
            (max, { width }) => (width > max ? width : max),
            0
          );
          const finalSize = {
            width: Math.max(minWidth * base, cleanup(regressionX(width))),
            height: Math.max(
              minHeight * base,
              cleanup(regressionY(resizer.clientHeight))
            ),
          };
          return finalSize;
        }
      }
      return undefined;
    },
    [minHeight, minWidth]
  );
  return getSize;
}

// linear regression of text node width to graph node size
function regressionX(x: number) {
  return Math.floor(0.63567 * x + 6);
}
function regressionY(x: number) {
  return Math.floor(0.63567 * x + 20);
}

// put things roughly on the same scale
function cleanup(x: number) {
  return Math.ceil(x / base) * base;
}

function preventCyRenderingBugs(str: string) {
  return (
    str
      // prevent break on hypen
      .replace(/-/gm, "&#x2011;")
      // prevent break on chinese comma
      .replace(/，/gm, "&#x2011;")
  );
}

export function useIsValidSponsor() {
  const { customer } = useContext(AppContext);
  return Boolean(customer?.subscription?.status === "active");
}

export function useIsValidCustomer() {
  const { customer } = useContext(AppContext);
  return Boolean(customer?.subscription);
}

export function useTitle(): [string, boolean] {
  const { workspace = "" } = useParams<{ workspace?: string }>();
  const { path, params } = useRouteMatch<{ id?: string }>();
  const id = params.id || undefined;
  const { data: chart } = useChart(id);
  if (path === "/u/:id" && chart) return [chart.name, true];
  return [workspace, false];
}

export function useCurrentHostedChart() {
  const { id } = useParams<{ id?: string }>();
  return useChart(id);
}
