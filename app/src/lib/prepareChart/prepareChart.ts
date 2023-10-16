import merge from "deepmerge";
import matter from "gray-matter";

import {
  delimiters,
  HIDDEN_GRAPH_OPTIONS_DIVIDER,
  newDelimiters,
} from "../constants";
import { getStyleStringFromMeta, preprocessStyle } from "../preprocessStyle";
import { Details, useDoc } from "../useDoc";
import { cytoscapeStyle, theme } from "../templates/default-template";
import { FFTheme } from "../FFTheme";

/**
 * Ensures the document loaded externally or from local storage
 * matches the format that we expect. It parses it and puts it
 * into a zustand store for use around the app
 *
 * ### Terminology
 * - `document` is the complete file contents (local or hosted)
 * - `text` is the document without the meta section
 * - `meta` is the meta section of the document
 * - `details` is an added section, stored on the client that contains
 *   information about this document
 */

export async function prepareChart(doc: string, details: Details) {
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

  const meta = merge.all([jsonMeta, parsedData, hidden]) as Record<string, any>;

  text = `${text.trim()}\n`;

  // If cytoscapeStyle is not defined, and themeEditor is not defined
  // load the default theme
  if (
    typeof meta.cytoscapeStyle === "undefined" &&
    typeof meta.themeEditor === "undefined"
  ) {
    meta.themeEditor = theme;
    meta.cytoscapeStyle = cytoscapeStyle;
  } else if (typeof meta.themeEditor === "undefined") {
    // or if there is cytoscapeStyle but no themeEditor, then
    // set the default theme but disable it
    meta.themeEditor = theme;
    meta.customCssOnly = true;
  }

  // If an old layout is defined, migrate it into the themeEditor
  if (typeof meta.layout !== "undefined") {
    let { name = "", spacingFactor = theme.spacingFactor } = meta.layout;
    if (name.startsWith("elk-")) {
      name = name.slice(4);
    }

    if (name) (meta.themeEditor as FFTheme).layoutName = name;

    (meta.themeEditor as FFTheme).spacingFactor = spacingFactor;

    // Delete the old layout
    delete meta.layout;
  }

  // delete the parser if it exists
  if (meta.parser) delete meta.parser;

  // pre-process style to load classes and font imports
  preprocessStyle(getStyleStringFromMeta(meta));

  useDoc.setState({ text, meta, details }, false, "prepareChart");

  return {
    text,
    meta,
    details,
  };
}
