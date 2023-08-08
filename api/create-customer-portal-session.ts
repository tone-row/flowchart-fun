import { VercelApiHandler } from "@vercel/node";
import { stripe } from "./_lib/_stripe";

const handler: VercelApiHandler = async (req, res) => {
  const customerId = req.body.customerId;
  const returnUrl = req.body.returnUrl;
  if (!customerId) {
    res.status(400).json({ error: "Customer ID is required" });
    return;
  }
  if (!returnUrl) {
    res.status(400).json({ error: "Return URL is required" });
    return;
  }
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  res.status(200).json({ url: session.url });
  return;
};

export default handler;
