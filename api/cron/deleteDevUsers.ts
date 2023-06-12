import Stripe from "stripe";
import { User, createClient } from "@supabase/supabase-js";

/**
 * In order to to keep the development environment clean,
 * this function will delete all users except those that have been excluded.
 *
 * Deleting users is primarily to ensure people don't abuse the dev
 * environment. We'll delete them from stripe and supbase.
 */

export default async function deleteDevUsers() {
  // Connect to Stripe
  const stripeTestModeSecretKey = process.env.STRIPE_TEST_MODE_SK;
  if (!stripeTestModeSecretKey) throw new Error("Stripe secret key not found");
  const stripe = new Stripe(stripeTestModeSecretKey, {
    apiVersion: "2022-11-15",
  });

  if (!process.env.EXCLUDED_USER_FROM_DELETION)
    throw new Error("No users to exclude from deletion");

  // Make sure that we have a list of users to exclude
  const excludedUsers = process.env.EXCLUDED_USER_FROM_DELETION.split(",");

  // Stripe - load all customers in while loop
  let stripeCustomers: Stripe.Customer[] = [];
  let stripeHasMore = true;
  let stripeStartingAfter: string | undefined;
  while (stripeHasMore) {
    const stripeCustomersResponse = await stripe.customers.list({
      limit: 100,
      starting_after: stripeStartingAfter,
    });
    if (!stripeCustomersResponse.data) throw new Error("No stripe customers");
    stripeCustomers = stripeCustomers.concat(stripeCustomersResponse.data);
    stripeHasMore = stripeCustomersResponse.has_more;
    stripeStartingAfter = stripeCustomersResponse.data.slice(-1)[0].id;
  }

  // delete all customers except those that are excluded
  const stripeCustomersToDelete = stripeCustomers.filter(
    (customer) => !excludedUsers.includes(customer.email as string)
  );

  if (stripeCustomersToDelete.length === 0) {
    console.log("No Stripe customers to delete");
  }

  for (const customer of stripeCustomersToDelete) {
    console.log(`Deleting customer ${customer.id} (${customer.email})`);
    await stripe.customers.del(customer.id);
  }

  // Connect to supabase
  const supabaseStagingProjectUrl = process.env.SUPABASE_STAGING_PROJECT_URL;
  if (!supabaseStagingProjectUrl)
    throw new Error("No Supabase staging project URL");
  const supabaseStagingServiceKey = process.env.SUPABASE_STAGING_SERVICE_KEY;
  if (!supabaseStagingServiceKey)
    throw new Error("No Supabase staging service key");

  const supabase = createClient(
    supabaseStagingProjectUrl,
    supabaseStagingServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const adminAuthClient = supabase.auth.admin;

  let page = 1;
  let lastPage = Infinity;
  let supabaseUsers: User[] = [];

  while (page <= lastPage) {
    // The GoTrue types appear to be out of date, confirmed that this works
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const supabaseUsersResponse = await adminAuthClient.listUsers({
      page,
      perPage: 1000,
    });

    if (!supabaseUsersResponse.data) {
      console.log("Error: No users found");
      lastPage = 0;
      continue;
    }

    supabaseUsers = supabaseUsers.concat(supabaseUsersResponse.data.users);
    lastPage = (supabaseUsersResponse.data as unknown as { lastPage: number })
      .lastPage;

    page = page + 1;
  }

  const supabaseUsersToDelete = supabaseUsers.filter(
    (user) => !excludedUsers.includes(user.email as string)
  );

  // print the number of users
  console.log(`Found ${supabaseUsersToDelete.length} users to delete`);

  // delete all users except those that are excluded
  for (const user of supabaseUsersToDelete) {
    console.log(`Deleting user ${user.id} (${user.email})`);

    // delete the users charts first
    await supabase.from("user_charts").delete().eq("user_id", user.id);

    // delete the user
    await adminAuthClient.deleteUser(user.id);
  }

  console.log("Done");
}
