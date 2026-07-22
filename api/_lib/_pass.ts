import type { default as Stripe } from "stripe";

export const PASS_METADATA_KEY = "ff_pass";
export const PASS_DURATION_SECONDS = 30 * 24 * 60 * 60;

export type ActivePass = {
  /** Epoch seconds, same unit as subscription.current_period_end */
  expiresAt: number;
  paymentIntentId: string;
};

/**
 * A PaymentIntent counts as a paid pass only if it succeeded, carries the
 * pass metadata, and its charge was neither refunded nor disputed. With no
 * webhooks, this predicate is the only enforcement point for refunds and
 * chargebacks. Callers must expand `latest_charge`.
 */
function isValidPassPayment(pi: Stripe.PaymentIntent): boolean {
  const charge = pi.latest_charge as Stripe.Charge | null;
  return (
    pi.status === "succeeded" &&
    Boolean(pi.metadata?.[PASS_METADATA_KEY]) &&
    !charge?.refunded &&
    !charge?.disputed
  );
}

/**
 * Returns the pass with the latest expiry among all valid pass payments —
 * not simply the newest PaymentIntent, so a refunded newer purchase can
 * never invalidate a still-valid older one. Null when none is active.
 */
export function getActivePass(
  paymentIntents: Stripe.PaymentIntent[],
  nowSeconds: number
): ActivePass | null {
  let best: ActivePass | null = null;
  for (const pi of paymentIntents) {
    if (!isValidPassPayment(pi)) continue;
    const expiresAt = pi.created + PASS_DURATION_SECONDS;
    if (!best || expiresAt > best.expiresAt) {
      best = { expiresAt, paymentIntentId: pi.id };
    }
  }
  return best && best.expiresAt > nowSeconds ? best : null;
}

export function isPaymentIntentActivePass(
  pi: Stripe.PaymentIntent,
  nowSeconds: number
): boolean {
  return (
    isValidPassPayment(pi) && pi.created + PASS_DURATION_SECONDS > nowSeconds
  );
}
