import { VercelRequest, VercelResponse } from "@vercel/node";
import { validStripePrices } from "./_lib/_validStripePrices";
import { stripe } from "./_lib/_stripe";
import type { default as Stripe } from "stripe";
import { getCustomerFromToken } from "./_lib/_helpers";

export default async function customerInfo(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const token = req.headers.authorization;
    const customer = await getCustomerFromToken(token);
    let subscription: Stripe.Subscription | null = null;

    if (!customer) {
      res.json({ customerId: null, subscription: null });
      return;
    }

    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 100,
      status: "all",
    });

    // get subscriptions with known prices
    const appSubs = subscriptions.filter((subscription) => {
      const priceId = subscription.items.data[0].plan.id;
      return validStripePrices.includes(priceId);
    });

    // sort them by creation date, newest first
    appSubs.sort((a, b) => {
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    });

    subscription = appSubs?.[0] ?? null;

    res.json({ customerId: customer.id, subscription });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error });
  }
}
