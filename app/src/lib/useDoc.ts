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

/**
 * Custom useDocDetails store
 */
export const useDetailsStore = create<Details>()(
  devtools(() => initialDetails, {
    name: "useDetailsStore",
  })
);
