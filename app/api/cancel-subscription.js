import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_KEY);

export default async function handler(req, res) {
  try {
    const subscription = await stripe.subscriptions.update(
      req.body.subscriptionId,
      { cancel_at_period_end: true }
    );

    res.json(subscription);
  } catch (error) {
    return res.status("402").send({ error: { message: error.message } });
  }
}
