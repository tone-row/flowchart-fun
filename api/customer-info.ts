import { VercelRequest, VercelResponse } from "@vercel/node";
import { validStripePrices } from "./_lib/_validStripePrices";
import { stripe } from "./_lib/_stripe";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const email = req.body.email;
  if (!email) return res.status(400).send({ error: "No email provided" });

  try {
    const { data: customers } = await stripe.customers.list({
      email,
    });
    if (!customers.length) throw new Error("No Customer Found");
    const customer = customers[0];

    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
    });

    const subscription = subscriptions.length ? subscriptions[0] : undefined;
    const priceId = subscription?.items.data[0].plan.id;

    if (!subscription || !priceId) throw new Error("No Subscription Found");

    // make sure priceId is valid
    if (!validStripePrices.includes(priceId)) {
      throw new Error("Invalid Subscription");
    }

    res.json({ customerId: customer.id, subscription });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error });
  }
}
