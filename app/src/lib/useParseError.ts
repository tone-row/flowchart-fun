import { create } from "zustand";

export const useParseError = create<{ error: string; errorFromStyle: string }>(
  () => ({
    error: "",
    errorFromStyle: "",
  })
);
