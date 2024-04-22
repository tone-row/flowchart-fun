import { create } from "zustand";

type PaywallModalStore = {
  open: boolean;
  title: string;
  content: string;
  movieUrl?: string;
  imgUrl?: string;
  /**
   * This is a unique code that will be used to track the user's journey
   */
  toPricingCode: string;
};

export const usePaywallModalStore = create<PaywallModalStore>((_set) => ({
  open: false,
  title: "",
  content: "",
  toPricingCode: "Unknown",
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
  toPricingCode,
}: Omit<PaywallModalStore, "open">) {
  // If there is no movie URL, we will preload the image
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
      toPricingCode,
    });
  }
}
