import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_KEY);

export default async function cancelSubscription(req, res) {
  stripe.subscriptions.update(
    req.body.subscriptionId,
    { cancel_at_period_end: true },
    function (err, subscription) {
      if (err) {
        return res.status("402").send({ error: { message: err.message } });
      }
      res.json(subscription);
    }
  );
}
