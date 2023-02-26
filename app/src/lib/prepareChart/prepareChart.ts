import merge from "deepmerge";
import matter from "gray-matter";

import {
  delimiters,
  HIDDEN_GRAPH_OPTIONS_DIVIDER,
  newDelimiters,
} from "../constants";
import { Details, useDoc, useDocDetailsStore } from "../useDoc";

/**
 * ### Goals
 * - store working graphs in memory regardless of whether they
 * are local or hosted. This will allow us to use the same code for both.
 *- handle the transition from embedded yaml and hidden options
 * to a single meta section (embedded JSON below the document).
 *
 * ### Terminology
 * - `document` is the complete file contents (local or hosted)
 * - `text` is the document without the meta section
 * - `meta` is the meta section of the document
 */

export function prepareChart(doc: string, details: Details) {
  let text = doc;

  let jsonMeta = {};
  // if the doc includes the new delimiters we can skip the migration step
  if (text.includes(newDelimiters)) {
    const parts = text.split(newDelimiters);
    text = parts[0];
    const metaStr = parts[1] || "{}";
    try {
      jsonMeta = JSON.parse(metaStr.trim());
    } catch (e) {
      console.log(e);
    }
  }

  let hidden = {};
  if (text.includes(HIDDEN_GRAPH_OPTIONS_DIVIDER)) {
    const parts = text.split(HIDDEN_GRAPH_OPTIONS_DIVIDER);
    text = parts[0];
    const hiddenStr = parts[1] || "{}";
    try {
      hidden = JSON.parse(hiddenStr.trim());
    } catch (e) {
      console.log(e);
    }
  }

  let parsedData = {};
  if (text.includes(delimiters)) {
    const parsed = matter(text, { delimiters });
    text = parsed.content;
    parsedData = parsed.data;
  }

  const meta = merge.all([jsonMeta, parsedData, hidden]) as Record<
    string,
    unknown
  >;

  // Because the new getDefaultChart() will return with graph-selector in the meta
  // and people have had to intentionally switch to graph selector thus far
  // if we get to this point and DON'T have a parser in the meta, we can assume
  // that it's the v1 parser, and we'll add it to keep compatibility
  if (!meta.parser) {
    meta.parser = "v1";
  }

  text = `${text.trim()}\n`;

  useDoc.setState({ text, meta }, false, "prepareChart");
  // set the useDocDetailsStore too
  useDocDetailsStore.setState(details, false, "prepareChart");

  return {
    text,
    meta,
    details,
  };
}
