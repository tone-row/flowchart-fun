import matter from "gray-matter";
// import { useState } from "react";
import { GraphOptionsObject } from "../constants";

export default function useGraphOptions(text: string): GraphOptionsObject {
  try {
    const { data } = matter(text, { delimiters: "~~~" });
    return data;
  } catch (error) {
    return {};
  }
}
