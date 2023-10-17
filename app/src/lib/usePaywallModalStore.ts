import { create } from "zustand";

export const usePaywallModalStore = create<{
  open: boolean;
  title: string;
  content: string;
  movieUrl?: string;
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
  movieUrl,
}: {
  title: string;
  content: string;
  movieUrl?: string;
}) {
  if (!movieUrl) {
    // Pre-load the paywall image
    const img = new Image();
    img.onload = open;
    img.src = paywallImageUrl;
  } else {
    open();
  }

  function open() {
    usePaywallModalStore.setState({
      open: true,
      title,
      content,
      movieUrl,
    });
  }
}
