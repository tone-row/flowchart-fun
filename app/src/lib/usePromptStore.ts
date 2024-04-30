import { create } from "zustand";

type PromptStore = {
  convertIsRunning: boolean;
};

export const usePromptStore = create<PromptStore>(() => ({
  convertIsRunning: false,
}));

export function startConvert() {
  usePromptStore.setState({ convertIsRunning: true });
}

export function stopConvert() {
  usePromptStore.setState({ convertIsRunning: false });
}
