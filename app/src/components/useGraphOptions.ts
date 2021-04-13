import matter from "gray-matter";
import { GraphOptionsObject } from "../constants";

export default function useGraphOptions(
  text: string
): { graphOptions: GraphOptionsObject; content: string } {
  try {
    const { data: graphOptions, content } = matter(text, { delimiters: "~~~" });
    return { graphOptions, content };
  } catch (error) {
    return { graphOptions: {}, content: text };
  }
}
