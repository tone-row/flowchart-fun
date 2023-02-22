import { VercelRequest, VercelResponse } from "@vercel/node";
import { isError } from "./_lib/_helpers";
import { stripe } from "./_lib/_stripe";

const subscriptionTypes = {
  monthly: process.env.STRIPE_PRICE_ID,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY,
};

export default async function createSubscription(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const subscriptionType = req.body.subscriptionType ?? "monthly";
    if (!subscriptionTypeValid(subscriptionType)) {
      throw new Error("Invalid subscription type");
    }
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
    return res.status(402).send({
      error: {
        message: isError(error) ? error.message : "Something went wrong",
      },
    });
  }
}

function subscriptionTypeValid(
  subscriptionType: string
): subscriptionType is keyof typeof subscriptionTypes {
  return subscriptionType in subscriptionTypes;
}
