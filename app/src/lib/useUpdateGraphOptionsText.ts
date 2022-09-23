import merge from "deepmerge";
import { stringify } from "gray-matter";
import { Dispatch, useCallback } from "react";

import { delimiters, GraphOptionsObject } from "./constants";

/**
 * Get a new text (including document and graph options) from updated graph options
 */
export function getNewTextFromGraphOptions({
  content,
  newOptions,
  currentOptions,
}: {
  content: string;
  newOptions: GraphOptionsObject;
  currentOptions: GraphOptionsObject;
}) {
  let text = "";
  // if already has graph options merge them
  if (Object.keys(currentOptions).length) {
    text = stringify(content, merge(currentOptions, newOptions), {
      delimiters,
    });
  } else {
    // No frontmatter
    text = stringify(content, newOptions, { delimiters });
  }
  return text;
}

/** Given new graph options, merge them and update the graph text */
export function useUpdateGraphOptionsText(
  content: string,
  graphOptions: GraphOptionsObject,
  setText: Dispatch<string>,
  setTextToParse: Dispatch<string>
) {
  return useCallback(
    (o: GraphOptionsObject) => {
      const newText = getNewTextFromGraphOptions({
        content,
        newOptions: o,
        currentOptions: graphOptions,
      });
      setText(newText);
      setTextToParse(newText);
    },
    [content, graphOptions, setText, setTextToParse]
  );
}
