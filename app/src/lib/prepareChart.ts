/**
get the text
  parse it & repair it if necessary
    store it in memory
      render: graph
      read: text editor
        save: (store it in memory)
      async/cron write to: (local storage)
local storage
  page load: (get the text)
**/

import merge from "deepmerge";
import matter from "gray-matter";
import create from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import {
  delimiters,
  HIDDEN_GRAPH_OPTIONS_DIVIDER,
  newDelimiters,
} from "./constants";

type Details = {
  /** Represents the workspace ID if local, and the db ID if hosted */
  id: string | number;
  /** Workspace ID if local, Chart title if hosted */
  title: string;
  /** True if hosted, false if local */
  isHosted: boolean;
  /** Whether or not the chart has a public URL */
  isPublic?: boolean;
  /** The public ID for the chart */
  publicId?: string;
};

export type Doc = {
  text: string;
  meta: Record<string, unknown>;
  details: Details;
};

export const initialDoc = {
  text: "",
  meta: {},
  details: {
    id: "",
    title: "",
    isHosted: false,
  },
};

export const useDoc = create(subscribeWithSelector<Doc>(() => initialDoc));

/**
 * The goal of this function is to remove some of the complexity around
 * useLocalDoc, useHostedDoc, useParseDoc, + useUpdateGraphOptionsText.
 *
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

  text = `${text.trim()}\n`;

  useDoc.setState({ text, meta, details });

  return {
    text,
    meta,
    details,
  };
}

export function docToString(doc: Doc) {
  const { text, meta } = doc;
  return [
    text,
    newDelimiters,
    JSON.stringify(meta, null, 2),
    newDelimiters,
  ].join("\n");
}

export const useParseError = create<{ error: string; errorFromStyle: string }>(
  () => ({
    error: "",
    errorFromStyle: "",
  })
);

/**
 * Get a type-safe version of any property
 * of the doc details
 */
export function useDocDetails<K extends keyof Details>(
  prop: K,
  fallback?: Details[K]
) {
  return useDoc((state) => state.details[prop] || fallback) as Details[K];
}
