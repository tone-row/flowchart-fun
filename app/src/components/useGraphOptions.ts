import matter from "gray-matter";

import { delimiters, GraphOptionsObject } from "../lib/constants";

export default function useGraphOptions(text: string): {
  graphOptions: GraphOptionsObject;
  content: string;
  graphOptionsString: string;
  linesOfYaml: number;
} {
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
      linesOfYaml: graphOptionsString.split("\n").length + 1,
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
