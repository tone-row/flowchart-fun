import { VercelApiHandler } from "@vercel/node";
import type { default as Stripe } from "stripe";
import { stripe } from "./_lib/_stripe";
import { getBaseUrl } from "./_lib/_helpers";
import { PASS_METADATA_KEY } from "./_lib/_pass";

const plans = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_ID,
    mode: "subscription" as const,
  },
  yearly: {
    priceId: process.env.STRIPE_PRICE_ID_YEARLY,
    mode: "subscription" as const,
  },
  pass: {
    priceId: process.env.STRIPE_PRICE_ID_PASS,
    mode: "payment" as const,
  },
};

const handler: VercelApiHandler = async (req, res) => {
  const { email, plan } = req.body;
  if (!email || !plan) {
    res.status(400).send("Missing parameters");
    return;
  }

  const planConfig = plans[plan as keyof typeof plans];
  if (!planConfig?.priceId) {
    res.status(400).send("Invalid plan");
    return;
  }

  try {
    let session: Stripe.Checkout.Session;
    if (planConfig.mode === "payment") {
      // The pass entitlement is later found by listing PaymentIntents on the
      // customer that getCustomerFromToken resolves by email (newest-first),
      // so the payment must land on that same customer — otherwise a freshly
      // created pass-customer would shadow one holding subscription history.
      const existing = await stripe.customers.list({ email, limit: 10 });
      const customer = existing.data
        .filter((c) => !c.deleted)
        .sort((a, b) => b.created - a.created)[0];

      session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: planConfig.priceId, quantity: 1 }],
        payment_intent_data: {
          metadata: { [PASS_METADATA_KEY]: "30-day" },
        },
        invoice_creation: { enabled: true },
        // Setting customer/customer_email locks the email field on the
        // Stripe page, keeping the payment attached to the account's email.
        ...(customer
          ? { customer: customer.id }
          : { customer_email: email, customer_creation: "always" as const }),
        success_url: `${getBaseUrl()}/success?pass=true`,
        cancel_url: `${getBaseUrl()}/pricing`,
      });
    } else {
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
          {
            price: planConfig.priceId,
            quantity: 1,
          },
        ],
        customer_email: email,
        success_url: `${getBaseUrl()}/success`,
        cancel_url: `${getBaseUrl()}/pricing`,
      });
    }

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default handler;
