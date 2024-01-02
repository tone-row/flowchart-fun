import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MobileEditorTab = "text" | "graph";

export type MobileStore = {
  tab: MobileEditorTab;
  toggleTab: () => void;
};

/**
 * Stores client-side state related to the editor.
 */
export const useMobileStore = create<MobileStore>()(
  persist(
    (set) => ({
      tab: "text",
      toggleTab: () =>
        set((state) => ({
          tab: state.tab === "text" ? "graph" : "text",
        })),
    }),
    {
      name: "ff-mobile-store",
    }
  )
);
