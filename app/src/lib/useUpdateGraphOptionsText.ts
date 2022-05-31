import merge from "deepmerge";
import { stringify } from "gray-matter";
import { Dispatch, useCallback } from "react";

import { delimiters, GraphOptionsObject } from "./constants";

/** Given new graph options, merge them and update the graph text */
export function useUpdateGraphOptionsText(
  content: string,
  graphOptions: GraphOptionsObject,
  setText: Dispatch<string>,
  setTextToParse: Dispatch<string>,
  textToParse: string
) {
  return useCallback(
    (o: GraphOptionsObject) => {
      let text = "";
      if (Object.keys(graphOptions).length) {
        text = stringify(content, merge(graphOptions, o), {
          delimiters,
        });
      } else {
        // No frontmatter
        text = stringify(textToParse, o, { delimiters });
      }
      setText(text);
      setTextToParse(text);
    },
    [content, graphOptions, setText, setTextToParse, textToParse]
  );
}
