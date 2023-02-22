import { VercelRequest, VercelResponse } from "@vercel/node";
import { isError } from "./_lib/_helpers";
import { stripe } from "./_lib/_stripe";

export default async function cancelSubscription(
  req: VercelRequest,
  res: VercelResponse
) {
  const subscriptionId = req.body.subscriptionId;
  if (!subscriptionId)
    return res.status(400).send({ error: "No subscription ID provided" });

  try {
    const cancelled = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    res.json(cancelled);
  } catch (error) {
    res.status(402).send({
      error: {
        message: isError(error) ? error.message : "Something went wrong",
      },
    });
  }
}
