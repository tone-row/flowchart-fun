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

    // find the first valid subscription
    const validSubscriptions = subscriptions.filter((subscription) => {
      const priceId = subscription.items.data[0].plan.id;
      return validStripePrices.includes(priceId);
    });

    // Sort active subscriptions to the top
    validSubscriptions.sort((a, b) => {
      if (a.status === "active") return -1;
      if (b.status === "active") return 1;
      return 0;
    });

    const subscription = validSubscriptions.length
      ? validSubscriptions[0]
      : undefined;

    res.json({ customerId: customer.id, subscription });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error });
  }
}
