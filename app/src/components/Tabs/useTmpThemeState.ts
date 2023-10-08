import { create } from "zustand";
import { FFTheme } from "../../lib/toTheme";

export const useTmpThemeState = create<FFTheme>()(() => ({
  layoutName: "dagre",
  layoutDirection: "LR",
}));
