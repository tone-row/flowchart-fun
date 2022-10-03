import { useThrottleCallback } from "@react-hook/throttle";
import { compressToEncodedURIComponent as compress } from "lz-string";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useLocalStorage from "react-use-localstorage";

import { AppContext } from "../components/AppContext";
import useGraphOptions from "../components/useGraphOptions";
import { HIDDEN_GRAPH_OPTIONS_DIVIDER } from "./constants";
import { getBackground } from "./getBackground";
import { getHiddenGraphOptionsText } from "./getHiddenGraphOptionsText";
import { useGraphTheme } from "./graphThemes";
import { UpdateDoc } from "./UpdateDoc";
import { useDefaultDoc } from "./useDefaultDoc";
import {
  getNewTextFromGraphOptions,
  useUpdateGraphOptionsText,
} from "./useUpdateGraphOptionsText";

export function useLocalDoc(defaultWorkspace = "") {
  const { workspace = defaultWorkspace } = useParams<{ workspace?: string }>();
  const defaultText = useDefaultDoc();
  const [fullText, setFullText] = useLocalStorage(
    ["flowcharts.fun", workspace].filter(Boolean).join(":"),
    defaultText
  );

  const parts = fullText.split(HIDDEN_GRAPH_OPTIONS_DIVIDER);
  const text = parts[0];
  const hiddenGraphOptionsText = parts[1] ?? "{}";

  const setText = (newText: string) => {
    setFullText(
      newText + HIDDEN_GRAPH_OPTIONS_DIVIDER + hiddenGraphOptionsText
    );
  };

  let hiddenGraphOptions = {};
  try {
    hiddenGraphOptions = JSON.parse(hiddenGraphOptionsText.trim());
  } catch (e) {
    console.log(e);
  }

  // Should we freeze graph
  const isFrozen = "nodePositions" in hiddenGraphOptions;

  // TODO: the share link should be moved into a tiny zustand store
  const { setShareLink } = useContext(AppContext);
  useEffect(() => {
    setShareLink(compress(fullText));
  }, [fullText, setShareLink]);

  const [toParse, setToParse] = useState(text);
  const throttleSetToParse = useThrottleCallback(setToParse, 2, true);

  useEffect(() => {
    throttleSetToParse(text);
  }, [text, throttleSetToParse]);

  const options = useGraphOptions(text);

  const updateGraphOptionsText = useUpdateGraphOptionsText(
    options.content,
    options.graphOptions,
    setText,
    setToParse
  );

  /**
   * Local Storage Text is broken into three pieces:
   * graph options, text, and hidden graph options
   *
   * This updater builds new local storage text from the three pieces
   * Replacing any existing pieces with ones passed as arguments
   */
  const updateLocalDoc: UpdateDoc = (update) => {
    // set t to text w/o hidden graph options
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

      /**
       * Because hidden graph options are not throttled,
       * if updating them, we need to make sure to immediately
       * update the throttled text to prevent a double render,
       * i.e., short-circuit the throttle
       */

      // set
      setFullText(combinedText);
      // update throttled text
      // setToParse(t);
    } else {
      // set text
      setText(t);
    }
  };

  // Get theme
  const theme = useGraphTheme(options.graphOptions.theme);
  const bg = getBackground(options.graphOptions, theme);

  return {
    /** Text and Graph Options, what goes in the editor */
    text,
    /** What's hidden from editor: node positions */
    hiddenGraphOptions,
    fullText,
    options,
    toParse,
    setToParse,
    updateGraphOptionsText,
    updateLocalDoc,
    hiddenGraphOptionsText,
    theme,
    bg,
    isFrozen,
  };
}
