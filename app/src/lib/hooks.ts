/* eslint-disable no-empty */
import { t } from "@lingui/macro";
import { decompressFromEncodedURIComponent as decompress } from "lz-string";
import { Dispatch, useCallback, useContext } from "react";
import { useLocation, useParams, useRouteMatch } from "react-router-dom";
import useLocalStorage from "react-use-localstorage";

import { AppContext } from "../components/AppContext";
import { useChart } from "./queries";
import { Theme } from "./themes/constants";

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

// returns getSize based on theme to determine node size
export function useGetSize(theme: Theme) {
  return useCallback(
    (label: string, classes: string[]) => {
      const resizer = document.getElementById("resizer");
      if (resizer) {
        const text = preventCyRenderingBugs(label);
        // We have to write styles imperatively otherwise we get race conditions
        const style = {
          "max-width": `${getWidth(text.length)}px`,
          "font-size": `${
            theme.font?.fontSize ? 1.27 * theme.font.fontSize : 10
          }px`,
          "line-height": theme.font?.lineHeight,
          "font-family": theme.font?.fontFamily,
        };
        resizer.setAttribute(
          "style",
          `${Object.entries(style)
            .map(([key, value]) => `${key}: ${value};`)
            .join(" ")}`
        );
        // TODO: Widen boxes as box height climbs
        resizer.innerHTML = text;

        if (resizer.firstChild) {
          const range = document.createRange();
          range.selectNodeContents(resizer.firstChild);
          const width = Array.from(range.getClientRects()).reduce(
            (max, { width }) => (width > max ? width : max),
            0
          );
          const finalSize = {
            // width: Math.max(minWidth * base, width),
            // width: resizer.clientWidth,
            width,

            // height: Math.max(minHeight * base, resizer.clientHeight),
            height: resizer.clientHeight,
          };

          if (classes.includes("rectangle")) {
          }
          if (classes.includes("roundrectangle")) {
          }
          if (classes.includes("ellipse")) {
          }
          if (classes.includes("triangle")) {
          }
          if (classes.includes("pentagon")) {
          }
          if (classes.includes("hexagon")) {
          }
          if (classes.includes("heptagon")) {
          }
          if (classes.includes("octagon")) {
          }
          if (classes.includes("star")) {
            finalSize.width = finalSize.width * 2.25;
            finalSize.height = finalSize.height * 2.5;
          }
          if (classes.includes("barrel")) {
          }
          if (classes.includes("diamond")) {
          }
          if (classes.includes("vee")) {
          }
          if (classes.includes("rhomboid")) {
          }
          if (classes.includes("polygon")) {
          }
          if (classes.includes("tag")) {
          }
          if (classes.includes("round-rectangle")) {
          }
          if (classes.includes("round-triangle")) {
          }
          if (classes.includes("round-diamond")) {
          }
          if (classes.includes("round-pentagon")) {
          }
          if (classes.includes("round-hexagon")) {
          }
          if (classes.includes("round-heptagon")) {
          }
          if (classes.includes("round-octagon")) {
          }
          if (classes.includes("round-tag")) {
          }
          if (classes.includes("cut-rectangle")) {
          }
          if (classes.includes("bottom-round-rectangle")) {
          }
          if (classes.includes("concave-hexagon")) {
          }

          return finalSize;
        }
      }
      return undefined;
    },
    [theme]
  );
}

const A = -38.614819;
const B = 33.8993;
function getWidth(characters: number) {
  return Math.floor(A + B * Math.log(characters));
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
  const { path } = useRouteMatch();
  const isCompressed = ["/c/:graphText?", "/f/:graphText?"].includes(path);
  const { graphText = window.location.hash.slice(1) } = useParams<{
    graphText: string;
  }>();
  return isCompressed
    ? decompress(graphText) ?? ""
    : decodeURIComponent(graphText);
}

export function useIsHelp() {
  const { path } = useRouteMatch();
  return path === "/h";
}
