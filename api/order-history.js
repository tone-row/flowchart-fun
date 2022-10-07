import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_KEY);

export default async function handler(req, res) {
  try {
    const { data: invoices } = await stripe.invoices.list({
      customer: req.body.customerId,
      subscription: req.body.subscriptionId,
    });

    res.json({ invoices });
  } catch (error) {
    return res.status("402").send({ error: { message: error.message } });
  }
}
