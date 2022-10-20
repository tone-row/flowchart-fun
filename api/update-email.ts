import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../app/src/types/database.types";

if (
  !process.env.STRIPE_KEY ||
  !process.env.REACT_APP_SUPABASE_URL ||
  !process.env.DB_SECRET
)
  throw new Error("Missing env vars");

const stripe = new Stripe(process.env.STRIPE_KEY, {
  apiVersion: "2020-08-27",
});

const supabase = createClient<Database>(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.DB_SECRET
);

export default async function handler(req, res) {
  try {
    const { oldEmail, newEmail } = req.body;
    if (!oldEmail) throw new Error("Missing email in body");
    if (!newEmail) throw new Error("Missing newEmail in body");

    // Check if a customer exists with that email in stripe
    const { data: customers } = await stripe.customers.list({
      email: oldEmail,
    });
    if (!customers.length) throw new Error("Try Again Later");

    let customer = customers[0].id;

    // Check if new email is already in use
    const { data: newCustomers } = await stripe.customers.list({
      email: newEmail,
    });
    // Email already in use
    if (newCustomers.length) throw new Error("Try Again Later");

    // Update customers email
    await stripe.customers.update(customer, {
      email: newEmail,
    });

    res.status(200).send({ success: true });
  } catch (error) {
    return res.status("402").send({ error: error.message });
  }
}
