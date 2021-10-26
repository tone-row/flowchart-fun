import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_KEY);

export default async function handler(req, res) {
  try {
    const { data: customers } = await stripe.customers.list({
      email: req.body.email,
    });
    if (!customers.length) throw new Error("No Customer Found");
    let customer = customers[0];

    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: customer.id,
      price: process.env.STRIPE_PRICE_ID,
      status: "all",
    });

    let subscription = subscriptions.length ? subscriptions[0] : undefined;

    res.json({ customerId: customer.id, subscription });
  } catch (error) {
    console.error(error);
    return res.status("400").json({ error });
  }
}
