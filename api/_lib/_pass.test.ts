import type { default as Stripe } from "stripe";
import {
  PASS_DURATION_SECONDS,
  getActivePass,
  isPaymentIntentActivePass,
} from "./_pass";

const NOW = 1_800_000_000;
const DAY = 24 * 60 * 60;

function makePi({
  id = "pi_valid",
  created = NOW - 5 * DAY,
  status = "succeeded",
  metadata = { ff_pass: "30-day" } as Record<string, string>,
  refunded = false,
  disputed = false,
  amountRefunded = 0,
}: {
  id?: string;
  created?: number;
  status?: string;
  metadata?: Record<string, string>;
  refunded?: boolean;
  disputed?: boolean;
  amountRefunded?: number;
} = {}): Stripe.PaymentIntent {
  return {
    id,
    created,
    status,
    metadata,
    latest_charge: {
      refunded,
      disputed,
      amount_refunded: amountRefunded,
    },
  } as unknown as Stripe.PaymentIntent;
}

describe("getActivePass", () => {
  test("fresh succeeded pass is active with correct expiry", () => {
    const pi = makePi();
    expect(getActivePass([pi], NOW)).toEqual({
      expiresAt: pi.created + PASS_DURATION_SECONDS,
      paymentIntentId: "pi_valid",
    });
  });

  test("pass created 31 days ago is expired", () => {
    expect(getActivePass([makePi({ created: NOW - 31 * DAY })], NOW)).toBeNull();
  });

  test("payment without pass metadata is ignored", () => {
    expect(getActivePass([makePi({ metadata: {} })], NOW)).toBeNull();
  });

  test("non-succeeded payment is ignored", () => {
    expect(
      getActivePass([makePi({ status: "requires_payment_method" })], NOW)
    ).toBeNull();
  });

  test("fully refunded pass is invalid", () => {
    expect(getActivePass([makePi({ refunded: true })], NOW)).toBeNull();
  });

  test("disputed (charged-back) pass is invalid", () => {
    expect(getActivePass([makePi({ disputed: true })], NOW)).toBeNull();
  });

  test("partially refunded pass stays valid (deliberate)", () => {
    expect(
      getActivePass([makePi({ amountRefunded: 450 })], NOW)
    ).not.toBeNull();
  });

  test("refunded newer pass does not kill a still-valid older one", () => {
    const older = makePi({ id: "pi_older", created: NOW - 10 * DAY });
    const newer = makePi({
      id: "pi_newer",
      created: NOW - 1 * DAY,
      refunded: true,
    });
    expect(getActivePass([newer, older], NOW)).toEqual({
      expiresAt: older.created + PASS_DURATION_SECONDS,
      paymentIntentId: "pi_older",
    });
  });

  test("with multiple valid passes the latest expiry wins", () => {
    const older = makePi({ id: "pi_older", created: NOW - 20 * DAY });
    const newer = makePi({ id: "pi_newer", created: NOW - 2 * DAY });
    expect(getActivePass([older, newer], NOW)?.paymentIntentId).toBe(
      "pi_newer"
    );
  });

  test("empty list is null", () => {
    expect(getActivePass([], NOW)).toBeNull();
  });
});

describe("isPaymentIntentActivePass", () => {
  test("valid fresh pass", () => {
    expect(isPaymentIntentActivePass(makePi(), NOW)).toBe(true);
  });

  test("expired pass", () => {
    expect(
      isPaymentIntentActivePass(makePi({ created: NOW - 31 * DAY }), NOW)
    ).toBe(false);
  });

  test("disputed pass", () => {
    expect(isPaymentIntentActivePass(makePi({ disputed: true }), NOW)).toBe(
      false
    );
  });
});
