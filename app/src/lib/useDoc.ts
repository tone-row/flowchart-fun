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

import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

import { newDelimiters } from "./constants";

export type Details = {
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
  /** Details are *not* stored in DB. They represent the chart currently being viewed. */
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

export const useDoc = create(
  devtools(
    subscribeWithSelector<Doc>(() => initialDoc),
    {
      name: "useDoc",
    }
  )
);

export function docToString(doc: Doc) {
  const { text, meta } = doc;
  return [text, newDelimiters, JSON.stringify(meta), newDelimiters].join("\n");
}

type ParseErrorStore = {
  error: string;
  errorFromStyle: string;
  /** An Error Code referencing getParserErrors */
  parserErrorCode: string;
};

export const useParseErrorStore = create<ParseErrorStore>(() => ({
  error: "",
  errorFromStyle: "",
  parserErrorCode: "",
}));

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
