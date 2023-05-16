import { VercelRequest, VercelResponse } from "@vercel/node";
import { isError } from "./_lib/_helpers";
import { stripe } from "./_lib/_stripe";
import { validStripePrices } from "./_lib/_validStripePrices";

const subscriptionTypes = {
  monthly: process.env.STRIPE_PRICE_ID,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY,
};

/**
 * Creates or gets customer.
 * Makes sure they don't already have a subscription.
 * Creates an incomplete subscription for the customer.
 * Return the subscription id and client secret.
 * For any errors along the way, return a 402 with an error object.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const plan = req.body.plan as "monthly" | "yearly";
  const email = req.body.email;

  try {
    // Get or create customer
    const { data } = await stripe.customers.list({ email });
    let customer;
    if (data.length) {
      customer = data[0];
    } else {
      customer = await stripe.customers.create({ email });
    }

    // Check for existing subscription
    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: customer.id,
    });

    // If they already have a subscription in validStripePrices, return error
    if (
      subscriptions.some((sub) =>
        validStripePrices.includes(sub.items.data[0].price.id)
      )
    ) {
      return res.status(402).json({
        error: {
          message: "You already have a subscription.",
        },
      });
    }

    const priceId = subscriptionTypes[plan];
    if (!priceId) {
      return res.status(402).json({
        error: {
          message: "Invalid subscription type.",
        },
      });
    }

    // Create the subscription. Note we're expanding the Subscription's
    // latest invoice and that invoice's payment_intent
    // so we can pass it to the front end to confirm the payment
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: priceId,
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    const clientSecret =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      subscription.latest_invoice.payment_intent.client_secret;

    // Return subscription id and client secret
    res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret,
    });
  } catch (err) {
    if (isError(err)) {
      return res.status(402).json({
        error: {
          message: err.message,
        },
      });
    }
    return res.status(402).json({
      error: {
        message: "Unknown error.",
      },
    });
  }
}
