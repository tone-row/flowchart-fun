import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_KEY);

/**
 * Create Customer if it doesn't exist
 * Return existing customer if it does
 */
export default async function handler(req, res) {
  try {
    const { email } = req.body;
    const { data } = await stripe.customers.list({ email });
    let customer;
    if (data.length) {
      customer = data[0];

      // Check if subscription exists
      const { data: subscriptions } = await stripe.subscriptions.list({
        customer: customer.id,
        price: process.env.STRIPE_PRICE_ID,
      });

      if (subscriptions.length) {
        res.json({ customer, subscription: subscriptions[0] });
      } else {
        res.json({ customer });
      }
    } else {
      customer = await stripe.customers.create({ email });
      res.json({ customer });
    }
  } catch (error) {
    return res.status("402").send({ error: { message: error.message } });
  }
}
