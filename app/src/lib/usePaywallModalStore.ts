import { create } from "zustand";

export const usePaywallModalStore = create<{
  open: boolean;
  title: string;
  content: string;
}>((_set) => ({
  open: false,
  title: "",
  content: "",
}));
