import create from "zustand";

export const useRenameDialogStore = create<{
  isOpen: boolean;
  convertToHosted: boolean;
}>(() => ({
  isOpen: false,
  convertToHosted: false,
}));
