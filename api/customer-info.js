import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_KEY);

const validPrices = [
  process.env.STRIPE_PRICE_ID,
  process.env.STRIPE_PRICE_ID_YEARLY,
  process.env.LEGACY_STRIPE_PRICE_ID,
  process.env.LEGACY_STRIPE_PRICE_ID_YEARLY,
  ...process.env.OTHER_VALID_STRIPE_PRICE_IDS.split(","),
];

export default async function handler(req, res) {
  try {
    const { data: customers } = await stripe.customers.list({
      email: req.body.email,
    });
    if (!customers.length) throw new Error("No Customer Found");
    let customer = customers[0];

    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
    });

    let subscription = subscriptions.length ? subscriptions[0] : undefined;

    // check if valid price
    if (
      !subscription.items.data.some(({ plan }) => validPrices.includes(plan.id))
    ) {
      throw new Error("Subscription ID is not valid");
    }

    res.json({ customerId: customer.id, subscription });
  } catch (error) {
    console.error(error);
    return res.status("400").json({ error });
  }
}
