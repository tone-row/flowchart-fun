import matter from "gray-matter";

import { delimiters, GraphOptionsObject } from "../lib/constants";

export type UseGraphOptionsReturn = {
  graphOptions: GraphOptionsObject;
  content: string;
  graphOptionsString: string;
  linesOfYaml: number;
};

export default function useGraphOptions(text: string): UseGraphOptionsReturn {
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
}
