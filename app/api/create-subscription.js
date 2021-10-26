import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_KEY);

export default async function handler(req, res) {
  try {
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
      items: [{ price: process.env.STRIPE_PRICE_ID }],
      expand: ["latest_invoice.payment_intent"],
    });

    res.send(subscription);
  } catch (error) {
    return res.status("402").send({ error: { message: error.message } });
  }
}
