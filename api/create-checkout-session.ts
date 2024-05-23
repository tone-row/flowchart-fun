import { VercelApiHandler } from "@vercel/node";
import { stripe } from "./_lib/_stripe";
import { getBaseUrl } from "./_lib/_helpers";

const subscriptionTypes = {
  monthly: process.env.STRIPE_PRICE_ID,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY,
};

const handler: VercelApiHandler = async (req, res) => {
  const { email, plan } = req.body;
  if (!email || !plan) {
    res.status(400).send("Missing parameters");
    return;
  }

  const priceId = subscriptionTypes[plan as keyof typeof subscriptionTypes];
  if (!priceId) {
    res.status(400).send("Invalid plan");
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: `${getBaseUrl()}/success`,
      cancel_url: `${getBaseUrl()}/pricing`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default handler;
