import { create } from "zustand";

export const useTabsStore = create<{
  selectedTab: string;
}>((_set) => ({
  selectedTab: "Document",
}));
