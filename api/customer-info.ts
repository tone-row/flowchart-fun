import { VercelRequest, VercelResponse } from "@vercel/node";
import { validStripePrices } from "./_lib/_validStripePrices";
import { stripe } from "./_lib/_stripe";
import { getCustomerFromToken } from "./_lib/_helpers";

export default async function customerInfo(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const token = req.headers.authorization;
    const customer = await getCustomerFromToken(token);

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
