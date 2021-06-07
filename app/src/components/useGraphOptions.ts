import matter from "gray-matter";
import { delimiters, GraphOptionsObject } from "../constants";

export default function useGraphOptions(text: string): {
  graphOptions: GraphOptionsObject;
  content: string;
  graphOptionsString: string;
} {
  try {
    const {
      data: graphOptions,
      content,
      matter: graphOptionsString,
    } = matter(text, { delimiters });
    return { graphOptions, content, graphOptionsString };
  } catch (error) {
    return { graphOptions: {}, content: text, graphOptionsString: "" };
  }
}
