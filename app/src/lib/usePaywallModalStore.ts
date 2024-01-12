import { create } from "zustand";

export const usePaywallModalStore = create<{
  open: boolean;
  title: string;
  content: string;
  movieUrl?: string;
  imgUrl?: string;
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
  imgUrl = paywallImageUrl,
}: {
  title: string;
  content: string;
  movieUrl?: string;
  imgUrl?: string;
}) {
  if (!movieUrl) {
    // Pre-load the paywall image
    const img = new Image();
    img.onload = open;
    img.src = imgUrl;
  } else {
    open();
  }

  function open() {
    usePaywallModalStore.setState({
      open: true,
      title,
      content,
      movieUrl,
      imgUrl,
    });
  }
}
