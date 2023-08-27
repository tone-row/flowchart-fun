import { create } from "zustand";

export const useSandboxWarning = create<{
  isOpen: boolean;
}>((_set) => ({
  isOpen: false,
}));
