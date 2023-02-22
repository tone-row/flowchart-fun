import { VercelRequest, VercelResponse } from "@vercel/node";
import { isError } from "./_lib/_helpers";
import { stripe } from "./_lib/_stripe";
import { validStripePrices } from "./_lib/_validStripePrices";

const defaultErrorMessage = "Unable to Sign In. Are you a sponsor?";

/* Returns whether an email has a subscription */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { email } = req.body;
    if (!email) throw new Error(defaultErrorMessage);

    // Check if a customer exists with that email
    const { data: customers } = await stripe.customers.list({ email });
    if (!customers.length) throw new Error(defaultErrorMessage);

    const customer = customers[0].id;

    // Check if email has a subscription
    const { data: subscriptions } = await stripe.subscriptions.list({
      customer,
      status: "all",
    });

    const hasValidSubscription = subscriptions.some(({ items }) => {
      const priceId = items.data[0].plan.id;
      // make sure priceId is valid
      return validStripePrices.includes(priceId);
    });

    if (!hasValidSubscription) throw new Error(defaultErrorMessage);

    res.json({ subscription: "found" });
  } catch (error) {
    let message = isError(error) ? error.message : "Something went wrong";
    switch (message) {
      case "An error occurred with our connection to Stripe.":
        message = "A connection error occured";
        break;
    }
    return res.status(400).send({
      error: {
        message: isError(error) ? error.message : "Something went wrong",
      },
    });
  }
}
