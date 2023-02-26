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

/** Details represent the chart currently being viewed. */
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
};

const initialDetails: Details = {
  id: "",
  title: "",
  isHosted: false,
};

export const initialDoc = {
  text: "",
  meta: {},
  details: initialDetails,
};

export const useDoc = create(
  devtools(
    subscribeWithSelector<Doc>(() => initialDoc),
    {
      name: "useDoc",
    }
  )
);

/** Turns doc into the string we store in the database */
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
 * Custom useDocDetails store
 */
export const useDocDetailsStore = create<Details>()(
  devtools(() => initialDetails, {
    name: "useDocDetailsStore",
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
  return useDocDetailsStore((state) => state[prop] || fallback) as Details[K];
}
