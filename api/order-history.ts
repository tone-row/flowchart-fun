import { VercelRequest, VercelResponse } from "@vercel/node";
import { isError } from "./_lib/_helpers";
import { stripe } from "./_lib/_stripe";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { data: invoices } = await stripe.invoices.list({
      customer: req.body.customerId,
      subscription: req.body.subscriptionId,
    });

    res.json({ invoices });
  } catch (error) {
    return res.status(402).send({
      error: {
        message: isError(error) ? error.message : "Something went wrong",
      },
    });
  }
}
