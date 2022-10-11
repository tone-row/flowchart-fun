import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_KEY);

const subscriptionTypes = {
  monthly: process.env.STRIPE_PRICE_ID,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY,
};

export default async function handler(req, res) {
  try {
    const subscriptionType = req.body.subscriptionType ?? "monthly";
    const price = subscriptionTypes[subscriptionType];

    // Attach payment method to customer
    await stripe.paymentMethods.attach(req.body.paymentMethodId, {
      customer: req.body.customerId,
    });

    // Change the default invoice settings on the customer to the new payment method
    await stripe.customers.update(req.body.customerId, {
      invoice_settings: {
        default_payment_method: req.body.paymentMethodId,
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: req.body.customerId,
      items: [{ price }],
      expand: ["latest_invoice.payment_intent"],
    });

    res.send(subscription);
  } catch (error) {
    return res.status("402").send({ error: { message: error.message } });
  }
}
