import { t } from "@lingui/macro";
import { useThrottleCallback } from "@react-hook/throttle";
import { compressToEncodedURIComponent as compress } from "lz-string";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useLocalStorage from "react-use-localstorage";

import { AppContext } from "../components/AppContext";
import useGraphOptions from "../components/useGraphOptions";
import { GraphOptionsObject, HIDDEN_GRAPH_OPTIONS_DIVIDER } from "./constants";
import { HiddenGraphOptions } from "./helpers";
import {
  getNewTextFromGraphOptions,
  useUpdateGraphOptionsText,
} from "./useUpdateGraphOptionsText";

export function useLocalStorageText(defaultWorkspace = "") {
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
  const [localStorageText, setLocalStorageText] = useLocalStorage(
    ["flowcharts.fun", workspace].filter(Boolean).join(":"),
    defaultText
  );

  // check if the string contains our divider and divide if so
  /** the text w/o hidden graph options */
  let text = localStorageText,
    /** set the text w/o changing hidden graph options */
    setText = setLocalStorageText,
    /** anything stored in hidden graph options */
    hiddenGraphOptions: HiddenGraphOptions = {};

  if (localStorageText.includes(HIDDEN_GRAPH_OPTIONS_DIVIDER)) {
    const [_text, hiddenGraphOptionsText] = localStorageText.split(
      HIDDEN_GRAPH_OPTIONS_DIVIDER
    );
    text = _text;
    setText = (newText) => {
      setLocalStorageText(
        newText + HIDDEN_GRAPH_OPTIONS_DIVIDER + hiddenGraphOptionsText
      );
    };

    try {
      hiddenGraphOptions = JSON.parse(hiddenGraphOptionsText.trim());
    } catch (e) {
      console.log(e);
    }
  }

  const getHiddenGraphOptionsText = <T extends {}>(newOptions: T, t = text) => {
    return t + HIDDEN_GRAPH_OPTIONS_DIVIDER + JSON.stringify(newOptions);
  };

  const setHiddenGraphOptions = <T extends {}>(newOptions: T) => {
    const newText = getHiddenGraphOptionsText(newOptions);
    console.log("__ setHiddenGraphOptions", newText);
    setLocalStorageText(newText);
  };

  const { setShareLink } = useContext(AppContext);
  useEffect(() => {
    setShareLink(compress(localStorageText));
  }, [localStorageText, setShareLink]);

  const [toParse, setToParse] = useState(text);
  const throttleSetToParse = useThrottleCallback(setToParse, 2, true);

  useEffect(() => {
    throttleSetToParse(text);
  }, [text, throttleSetToParse]);

  const options = useGraphOptions(toParse);

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
  const updateLocalStorageText = (
    update:
      | {
          hidden?: object;
          text?: string;
        }
      | {
          hidden?: object;
          options?: GraphOptionsObject;
        }
  ) => {
    let t = text;
    if ("text" in update && update.text) {
      // Text has been updated from text editor
      t = update.text;
    } else if ("options" in update && update.options) {
      // Text has been updated from graph options
      t = getNewTextFromGraphOptions({
        content: options.content,
        currentOptions: options.graphOptions,
        newOptions: update.options,
      });
    }

    if ("hidden" in update && update.hidden) {
      // Hidden graph options have been updated
      const newText = getHiddenGraphOptionsText(update.hidden, t);
      setLocalStorageText(newText);
    }
  };

  return {
    text,
    setText,
    hiddenGraphOptions,
    setHiddenGraphOptions,
    fullText: localStorageText,
    options,
    throttleSetToParse,
    toParse,
    setToParse,
    updateGraphOptionsText,
    updateLocalStorageText,
  };
}
