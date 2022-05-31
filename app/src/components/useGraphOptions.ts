import matter from "gray-matter";
import { useMemo } from "react";

import { delimiters, GraphOptionsObject } from "../lib/constants";

type UseGraphOptionsReturn = {
  graphOptions: GraphOptionsObject;
  content: string;
  graphOptionsString: string;
  linesOfYaml: number;
};

export default function useGraphOptions(text: string): UseGraphOptionsReturn {
  return useMemo(() => {
    try {
      const {
        data: graphOptions = {},
        content,
        matter: graphOptionsString,
      } = matter(text, { delimiters });
      return {
        graphOptions,
        content,
        graphOptionsString,
        linesOfYaml: graphOptionsString
          ? graphOptionsString.split("\n").length + 1
          : 0,
      };
    } catch (error) {
      return {
        graphOptions: {},
        content: text,
        graphOptionsString: "",
        linesOfYaml: 0,
      };
    }
  }, [text]);
}
