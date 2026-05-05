import { VercelRequest, VercelResponse } from "@vercel/node";
import { isError, getCustomerFromToken } from "./_lib/_helpers";
import { stripe } from "./_lib/_stripe";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const token = req.headers.authorization;
    const customer = await getCustomerFromToken(token);

    if (!customer) {
      return res.status(401).json({ error: { message: "Unauthorized" } });
    }

    const { data: invoices } = await stripe.invoices.list({
      customer: customer.id,
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
