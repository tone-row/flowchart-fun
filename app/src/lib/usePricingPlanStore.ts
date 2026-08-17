import { create } from "zustand";

export type PricingPlan = "yearly" | "monthly" | "pass";

/**
 * Which plan is selected in the pricing-page checkout. Module-level (not
 * component state) so the hero "30-Day Pass" link, the #pass callout, and
 * the /pricing#pass deep-links from paywalls can preselect the pass before
 * the user reaches the checkout. Deliberately not reset on unmount: a user
 * sent to log in and back should land on the plan they picked.
 */
export const usePricingPlanStore = create<{
  plan: PricingPlan;
  setPlan: (plan: PricingPlan) => void;
}>((set) => ({
  plan: "yearly",
  setPlan: (plan) => set({ plan }),
}));
