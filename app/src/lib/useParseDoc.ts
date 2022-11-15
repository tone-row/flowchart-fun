import { useThrottle } from "@react-hook/throttle";
import { compressToEncodedURIComponent as compress } from "lz-string";
import { useContext, useEffect } from "react";

import { AppContext } from "../components/AppContext";
import useGraphOptions, {
  UseGraphOptionsReturn,
} from "../components/useGraphOptions";
import { GraphOptionsObject, HIDDEN_GRAPH_OPTIONS_DIVIDER } from "./constants";
import { getBackground } from "./getBackground";
import { getHiddenGraphOptionsText } from "./getHiddenGraphOptionsText";
import { useGraphTheme } from "./graphThemes";
import { Theme } from "./themes/constants";
import { UpdateDoc } from "./UpdateDoc";
import {
  getNewTextFromGraphOptions,
  useUpdateGraphOptionsText,
} from "./useUpdateGraphOptionsText";

type UseParseDocReturn = {
  text: string;
  options: UseGraphOptionsReturn;
  updateGraphOptionsText: (o: GraphOptionsObject) => void;
  hiddenGraphOptionsText: string;
  isFrozen: boolean;
  theme: Theme;
  bg: string;
};

type UseParseDocEditableReturn = UseParseDocReturn & {
  updateDoc: UpdateDoc;
};

export function useParseDoc(
  fullText: string,
  setFullText: (value: string) => void,
  editable: false
): UseParseDocReturn;
export function useParseDoc(
  fullText: string,
  setFullText: (value: string) => void,
  editable: true
): UseParseDocEditableReturn;
export function useParseDoc(
  fullText: string,
  setFullText: (value: string) => void,
  editable: boolean
) {
  // split hidden options from rest
  const parts = fullText.split(HIDDEN_GRAPH_OPTIONS_DIVIDER);
  const text = parts[0];
  const hiddenGraphOptionsText = parts[1] || "{}";
  let hiddenGraphOptions: any = {};
  try {
    hiddenGraphOptions = JSON.parse(hiddenGraphOptionsText.trim());
  } catch (e) {
    console.log(e);
  }

  const isFrozen = "nodePositions" in hiddenGraphOptions;

  const setText = (newText: string) => {
    setFullText(
      newText + HIDDEN_GRAPH_OPTIONS_DIVIDER + hiddenGraphOptionsText
    );
  };

  // TODO: the share link should be moved into a tiny zustand store
  const { setShareLink } = useContext(AppContext);
  useEffect(() => {
    setShareLink(compress(fullText));
  }, [fullText, setShareLink]);

  // have a throttled visible text
  const [toParse, setToParse] = useThrottle(text, 4);
  useEffect(() => {
    setToParse(text);
  }, [text, setToParse]);

  const options = useGraphOptions(toParse);

  const updateGraphOptionsText = useUpdateGraphOptionsText(
    options.content,
    options.graphOptions,
    setText,
    setToParse
  );

  const theme = useGraphTheme(options.graphOptions.theme);
  const bg = getBackground(options.graphOptions, theme);

  const r: UseParseDocReturn = {
    text,
    options,
    updateGraphOptionsText,
    hiddenGraphOptionsText,
    isFrozen,
    theme,
    bg,
  };

  if (!editable) return r;

  const updateDoc: UpdateDoc = (update) => {
    let t = text;
    if ("text" in update) {
      // if text has been updated from text editor
      t = update.text ?? "";
    } else if ("options" in update && update.options) {
      // Text has been updated from graph options
      t = getNewTextFromGraphOptions({
        content: options.content,
        currentOptions: options.graphOptions,
        newOptions: update.options,
      });
    }

    // if hidden graph options have been updated
    if ("hidden" in update && update.hidden) {
      // combine
      const combinedText = getHiddenGraphOptionsText(update.hidden, t);
      // set
      setFullText(combinedText);
    } else {
      // set text
      setText(t);
    }
  };

  return {
    ...r,
    updateDoc,
  };
}
