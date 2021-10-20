import { useContext } from "react";
import { QueryClient, useQuery } from "react-query";
import Stripe from "stripe";
import { AppContext } from "../components/AppContext";
import { supabase } from "../supabaseClient";
import { definitions } from "../types/supabase";

export const queryClient = new QueryClient();

queryClient.setDefaultOptions({
  queries: {
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  },
});

async function userFeatures(): Promise<string[]> {
  const response = await fetch("/api/feature", {
    mode: "cors",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
  });
  return await response.json();
}

/**
 * Feature flags for user based on session
 */
export function useUserFeatures() {
  return useQuery(["auth", "userFeatures"], userFeatures);
}

async function customerInfo(
  email: string | undefined
): Promise<{ customerId: string; subscription: Stripe.Subscription }> {
  if (!email) return Promise.reject(new Error("Invalid Email"));
  const response = await fetch("/api/customer-info", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
  return await response.json();
}

/**
 * Useful stripe info– customer id and subscription
 */
export function useCustomerInfo(email: string | undefined) {
  return useQuery(["auth", "customerInfo", email], () => customerInfo(email), {
    enabled: Boolean(email),
  });
}

/**
 * Send an email
 */
export async function mail(email: {
  from: string;
  text: string;
  to: string;
  subject: string;
}): Promise<{ success: boolean }> {
  const response = await fetch("/api/mail", {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    body: JSON.stringify({ email }),
    headers: { "Content-Type": "application/json" },
  });
  const result = await response.json();
  if (!result.success) throw new Error("Failed to send");
  return result;
}

/**
 * Validate user before sending sign in link
 */
export async function login(email: string): Promise<boolean> {
  const response = await fetch("/api/validate", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
    }),
  });
  const result = await response.json();
  if (result.error) throw result.error;
  const { error: supabaseErr } = await supabase.auth.signIn({
    email,
  });
  if (supabaseErr) throw supabaseErr;
  return true;
}

async function orderHistory(
  customerId?: string,
  subscriptionId?: string
): Promise<
  {
    id: string;
    amount_paid: number;
    created: number;
  }[]
> {
  if (!customerId || !subscriptionId) return [];
  const response = await fetch("/api/order-history", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId,
      subscriptionId,
    }),
  });
  const { error, invoices } = await response.json();
  if (error) throw error;
  return invoices;
}

export function useOrderHistory(customerId?: string, subscriptionId?: string) {
  return useQuery(
    ["auth", "orderHistory", customerId, subscriptionId],
    () => orderHistory(customerId, subscriptionId),
    {
      enabled: Boolean(customerId) && Boolean(subscriptionId),
      suspense: true,
    }
  );
}

const defaultChartText = `This app works by typing
  Indenting creates a link to the current line
  any text: before a colon creates a label
  Create a link directly using the exact label text
    like this: (This app works by typing)
    [custom ID] or
      by adding an [ID] and referencing that
        like this: (custom ID) // You can also use single-line comments
  /*
  or
  multiline
  comments

  Have fun! 🎉
  */`;

export async function makeChart({
  name,
  user_id,
  chart = defaultChartText,
}: {
  name: string;
  user_id: string;
  chart?: string;
}) {
  return supabase
    .from<definitions["user_charts"]>("user_charts")
    .insert({ name, chart, user_id });
}

async function userCharts() {
  const { data, error } = await supabase
    .from<definitions["user_charts"]>("user_charts")
    .select("id,name,created_at,updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export function useCharts() {
  const { session } = useContext(AppContext);
  return useQuery(["auth", "userCharts"], userCharts, {
    suspense: true,
    enabled: Boolean(session?.user?.id),
    refetchOnMount: true,
    staleTime: 0,
  });
}

async function getChart(id?: string) {
  if (!id) return;
  const { data, error } = await supabase
    .from<definitions["user_charts"]>("user_charts")
    .select("id,name,chart,updated_at,created_at")
    .eq("id", id);
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Invalid Chart ID");
  if (data.length > 1) throw new Error("Multiple Charts Found");
  return data[0];
}

export function useChart(id?: string) {
  return useQuery(["useChart", id], () => getChart(id), {
    enabled: Boolean(id),
    refetchOnMount: true,
    staleTime: 0,
    suspense: true,
  });
}

export async function updateChartText(chart: string, id?: string) {
  if (!id) return;
  return supabase
    .from<definitions["user_charts"]>("user_charts")
    .update({ chart })
    .eq("id", id);
}

export async function deleteChart({ chartId }: { chartId: number }) {
  const { data, error } = await supabase
    .from<definitions["user_charts"]>("user_charts")
    .delete()
    .match({ id: chartId });
  if (error) throw error;
  return data;
}

export function createSubscription({
  customerId,
  paymentMethodId,
}: {
  customerId: string;
  paymentMethodId: string;
}) {
  return (
    fetch("/api/create-subscription", {
      method: "post",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        customerId: customerId,
        paymentMethodId: paymentMethodId,
      }),
    })
      .then((response) => {
        return response.json();
      })
      // If the card is declined, display an error to the user.
      .then((result) => {
        if (result.error) {
          // The card had an error when trying to attach it to a customer.
          throw result;
        }
        return result;
      })
      .then((result) => {
        return {
          paymentMethodId: paymentMethodId,
          subscription: result,
        };
      })
      .catch((error) => {
        return error;
      })
  );
}
