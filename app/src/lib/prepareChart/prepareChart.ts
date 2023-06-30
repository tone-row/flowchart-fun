import merge from "deepmerge";
import matter from "gray-matter";

import {
  delimiters,
  HIDDEN_GRAPH_OPTIONS_DIVIDER,
  newDelimiters,
} from "../constants";
import { Details, useDoc } from "../useDoc";

/**
 * A function which makes sure that the document loaded externally
 * or from local storage matches the format that we expect. It parses
 * it and puts it into a zustand store for use around the app
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

  text = `${text.trim()}\n`;

  useDoc.setState({ text, meta, details }, false, "prepareChart");

  // check for theme
  replaceThemeWithCytoscapeStyle(meta);

  return {
    text,
    meta,
    details,
  };
}

async function replaceThemeWithCytoscapeStyle(meta: Record<string, unknown>) {
  if (meta.cytoscapeStyle) return;
  const theme = (meta.theme as string) ?? "original";
  const { cytoscapeStyle = "", background = "" } = await import(
    `../themes/${theme}`
  );

  // set the background if user has not set one
  if (background && !meta.background) {
    meta.background = background;
  }

  // set the cytoscapeStyle and remove the theme
  if (cytoscapeStyle) {
    meta.cytoscapeStyle = cytoscapeStyle;
    meta.background = background;
    delete meta.theme;
  }
}
