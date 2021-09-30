import { t } from "@lingui/macro";
import { Dispatch, useContext } from "react";
import { useLocation, useParams } from "react-router-dom";
import useLocalStorage from "react-use-localstorage";
import { GraphContext } from "./components/GraphProvider";
import { allGraphThemes, defaultGraphTheme } from "./components/graphThemes";

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
    (graphOptions.theme &&
      allGraphThemes.includes(graphOptions.theme) &&
      graphOptions.theme) ||
    defaultGraphTheme
  );
}
