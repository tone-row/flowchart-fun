import { create } from "zustand";

type PromptStore = {
  /** Whether we're currently converting text */
  convertIsRunning: boolean;
  /** The last result from running a conversion */
  lastResult: string | null;
};

export const usePromptStore = create<PromptStore>(() => ({
  convertIsRunning: false,
  lastResult: null,
}));

export function startConvert() {
  usePromptStore.setState({ convertIsRunning: true });
}

export function stopConvert() {
  usePromptStore.setState({ convertIsRunning: false });
}

export function setLastResult(result: string) {
  usePromptStore.setState({ lastResult: result });
}
