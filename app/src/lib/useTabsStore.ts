import { create } from "zustand";

export type Tab = "Document" | "Theme" | "Graph";

export const useTabsStore = create<{
  selectedTab: Tab;
}>((_set) => ({
  selectedTab: "Document",
}));
