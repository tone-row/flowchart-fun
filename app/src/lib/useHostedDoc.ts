import { useThrottle } from "@react-hook/throttle";
import { compressToEncodedURIComponent as compress } from "lz-string";
import { useContext, useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import { useDebouncedCallback } from "use-debounce";

import { AppContext } from "../components/AppContext";
import useGraphOptions from "../components/useGraphOptions";
import { HIDDEN_GRAPH_OPTIONS_DIVIDER } from "./constants";
import { getBackground } from "./getBackground";
import { getHiddenGraphOptionsText } from "./getHiddenGraphOptionsText";
import { useGraphTheme } from "./graphThemes";
import { updateChartText, useChart } from "./queries";
import { UpdateDoc } from "./UpdateDoc";
import {
  getNewTextFromGraphOptions,
  useUpdateGraphOptionsText,
} from "./useUpdateGraphOptionsText";

export function useHostedDoc(id?: string) {
  const { data } = useChart(id);

  // immediate, full state
  const [fullText, setFullText] = useState(data?.chart || "");
  const lastFullText = useRef(fullText);

  // split the text and hidden graph options
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
  const [toParse, setToParse] = useThrottle(text, 2);
  useEffect(() => {
    setToParse(text);
  }, [text, setToParse]);

  /**
   * Updates the full version of the text stored in state.
   * The hosted text is updated as a side effect.
   */
  const updateHostedDoc: UpdateDoc = (update) => {
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

  // get graph options
  const options = useGraphOptions(toParse);

  const updateGraphOptionsText = useUpdateGraphOptionsText(
    options.content,
    options.graphOptions,
    setText,
    setToParse
  );

  // get mutate and loading state
  const { mutate, isLoading } = useMutation((text: string) =>
    updateChartText(text, id)
  );
  // get debounced mutate
  const {
    callback: debounceMutate,
    flush,
    pending,
  } = useDebouncedCallback((currentText: string) => {
    mutate(currentText);
  }, 1000);

  useEffect(() => {
    if (lastFullText.current !== fullText) {
      debounceMutate(fullText);
      lastFullText.current = fullText;
    }
  }, [debounceMutate, fullText]);

  // theme stuff
  const theme = useGraphTheme(options.graphOptions.theme);
  const bg = getBackground(options.graphOptions, theme);

  return {
    fullText,
    text,
    setText,
    toParse,
    hiddenGraphOptions,
    options,
    flush,
    pending,
    isLoading,
    updateHostedDoc,
    updateGraphOptionsText,
    hiddenGraphOptionsText,
    theme,
    bg,
    isFrozen,
  };
}
