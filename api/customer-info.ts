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

    // get subscriptions with known prices
    const validSubscriptions = subscriptions.filter((subscription) => {
      const priceId = subscription.items.data[0].plan.id;
      return validStripePrices.includes(priceId);
    });

    // sort them by creation date, newest first
    validSubscriptions.sort((a, b) => {
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    });

    const subscription = validSubscriptions?.[0];

    res.json({ customerId: customer.id, subscription });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error });
  }
}
