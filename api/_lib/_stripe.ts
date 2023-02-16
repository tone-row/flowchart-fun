import Stripe from "stripe";
const apiKey = process.env.STRIPE_KEY;

if (!apiKey) throw new Error("No Stripe API key provided");

export const stripe = new Stripe(apiKey, {
  apiVersion: "2020-08-27",
});
