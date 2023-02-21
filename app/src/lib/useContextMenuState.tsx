import { create } from "zustand";

type ContextMenuState = {
  active: null | {
    id: string;
    lineNumber: number;
    type: "node" | "edge";
  };
};
export const useContextMenuState = create<ContextMenuState>(() => ({
  active: null,
}));
