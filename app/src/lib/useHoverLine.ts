import { create } from "zustand";

export const useHoverLine = create<{
  line?: number;
}>(() => ({}));
