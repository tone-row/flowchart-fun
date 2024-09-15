import { t } from "@lingui/macro";
import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";

type Variant =
  | "unlimited-yearly"
  | "join-creators"
  | "boost-productivity"
  | "anytime-yearly"
  | "users-love"
  | "unlock-unlimited";

/**
 * Returns the copy for the button on the AI paywall modal
 */
export function useGetAIPaywallCopy() {
  const posthog = usePostHog();
  return useCallback(() => {
    const variant = posthog.featureFlags.getFeatureFlag(
      "ai-paywall-copy-conversion"
    ) as Variant;

    switch (variant) {
      case "unlimited-yearly":
        return t`Unlimited AI Flowcharts: $2/mo (billed yearly)`;
      case "join-creators":
        return t`Join 5,000+ AI Flowchart Creators. $4/mo`;
      case "boost-productivity":
        return t`Unlimited AI Flowcharts - Boost Productivity Now`;
      case "anytime-yearly":
        return t`AI Flowcharts Anytime - $2/mo (billed yearly)`;
      case "users-love":
        return t`5,000+ Users Love AI Flowcharts - Join Now`;
      case "unlock-unlimited":
        return t`Unlock Unlimited AI Flowcharts`;
    }
  }, [posthog.featureFlags]);
}
