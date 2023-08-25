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

const paywallImageUrl = "/images/paywall.png";

/**
 * Open the paywall with some content
 *
 * Also pre-load the paywall image
 * */
export function showPaywall({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  // Pre-load the paywall image
  const img = new Image();
  img.onload = open;
  img.src = paywallImageUrl;

  function open() {
    usePaywallModalStore.setState({
      open: true,
      title,
      content,
    });
  }
}
