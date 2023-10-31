import Stripe from "stripe";
import { stripe } from "./_stripe";
import { supabase } from "./_supabase";

export async function getCustomerFromToken(
  token?: string
): Promise<Stripe.Customer> {
  if (!token) throw new Error("No token provided");

  // get supabase user from the token
  const { data } = await supabase.auth.getUser(token.split(" ")[1]);

  const user = data.user;

  // if no user, throw an error
  if (!user) throw new Error("No user found");

  // if user, grab user email
  const email = user.email;

  // if no email, throw an error
  if (!email) throw new Error("No email found");

  const customers = await stripe.customers.list({
    email,
  });

  // grab the customer that was created the most recently
  const customer = customers.data[0];

  // if no customer id, throw an error
  if (!customer) throw new Error("No customer found");

  return customer;
}

/**
 * Makes sure that the costumer has an active subscription
 * @param token "Bearer <token>"
 */
export async function confirmActiveSubscriptionFromToken(token?: string) {
  try {
    const customer = await getCustomerFromToken(token);

    // if no customer id, throw an error
    if (!customer) throw new Error("No customer found");

    // get stripe subscriptions from the user email
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
    });

    // make sure at least one subscription exists and is active
    if (subscriptions.data.length === 0)
      throw new Error("No subscriptions found");

    const hasActiveSubscription = subscriptions.data.some(
      (subscription) => subscription.status === "active"
    );

    if (!hasActiveSubscription)
      throw new Error("No active subscriptions found");
  } catch {
    return false;
  }

  return true;
}

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Returns the correct base url depending on the environment
 */
export function getBaseUrl() {
  if (process.env.VERCEL_ENV === "production") {
    return "https://flowchart.fun";
  } else if (process.env.VERCEL_ENV === "preview") {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
