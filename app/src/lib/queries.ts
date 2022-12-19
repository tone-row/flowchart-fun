import { t } from "@lingui/macro";
import { PostgrestError } from "@supabase/supabase-js";
import { useContext } from "react";
import { QueryClient, useQuery } from "react-query";
import Stripe from "stripe";

import { AppContext, UserSettings } from "../components/AppContext";
import { LOCAL_STORAGE_SETTINGS_KEY } from "./constants";
import { supabase } from "./supabaseClient";

export const queryClient = new QueryClient();

queryClient.setDefaultOptions({
  queries: {
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  },
});

// Currently Unused
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

export async function customerInfo(
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
  return response.json();
}

/**
 * Useful stripe info– customer id and subscription
 */
export function useCustomerInfo(email: string | undefined) {
  return useQuery(["auth", "customerInfo", email], () => customerInfo(email), {
    enabled: Boolean(email),
    staleTime: Infinity,
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
  if (!supabase) return false;
  const response = await fetch("/api/validate", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
    }),
  });
  let result;
  try {
    result = await response.json();
  } catch (e) {
    console.log(e);
  }
  if (result?.error) throw result.error;
  if (!response.ok) throw new Error("Unable to connect");
  const { error: supabaseErr } = await supabase.auth.signInWithOtp({
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

export async function makeChart({
  name,
  user_id,
  chart,
}: {
  name: string;
  user_id: string;
  chart?: string;
}) {
  if (!supabase) return;
  const defaultText = `${t`This app works by typing`}
  ${t`Indenting creates a link to the current line`}
  ${t`any text: before a colon creates a label`}
  ${t`Create a link directly using the exact label text`}
    ${t`like this: (This app works by typing)`}
    ${t`[custom ID] or`}
      ${t`by adding an %5BID%5D and referencing that`}
        ${t`like this: (custom ID) // You can also use single-line comments`}
/*
${t`or`}
${t`multiline`}
${t`comments`}

${t`Have fun! 🎉`}
*/`;

  return await supabase
    .from("user_charts")
    .insert({ name, chart: chart ?? defaultText, user_id })
    .select();
}

async function userCharts() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("user_charts")
    .select("id,name,created_at,updated_at,is_public")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

/** We can manually pass the user id if we use this hook above the AppContext */
export function useHostedCharts(iUserId?: string) {
  const { session } = useContext(AppContext);
  const userId = iUserId ?? session?.user?.id;
  const enabled = !!userId;
  return useQuery(["auth", "hostedCharts"], userCharts, {
    suspense: false,
    enabled,
    refetchOnMount: true,
    staleTime: 0,
  });
}

export async function getHostedChart(id?: string) {
  if (!id) return;
  if (!supabase) return;
  const { data, error } = await supabase
    .from("user_charts")
    .select("id,name,chart,updated_at,created_at,public_id,is_public")
    .eq("id", id);
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Invalid Chart ID");
  if (data.length > 1) throw new Error("Multiple Charts Found");
  return data[0];
}

export function useChart(id: string) {
  return useQuery(["useChart", id], () => getHostedChart(id), {
    enabled: Boolean(id),
    refetchOnMount: true,
    staleTime: 2000,
    cacheTime: 2000,
    suspense: true,
  });
}

export async function updateChartText(chart: string, id?: string) {
  if (!id) return;
  if (!supabase) return;
  return supabase.from("user_charts").update({ chart }).eq("id", id);
}

export async function deleteChart({ chartId }: { chartId: number }) {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("user_charts")
    .delete()
    .match({ id: chartId })
    .select();
  if (error) throw error;
  return data;
}

export function createSubscription({
  customerId,
  paymentMethodId,
  subscriptionType,
}: {
  customerId: string;
  paymentMethodId: string;
  subscriptionType: "monthly" | "yearly";
}) {
  return (
    fetch("/api/create-subscription", {
      method: "post",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        customerId,
        paymentMethodId,
        subscriptionType,
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

export async function createCustomer(email: string) {
  const response = await fetch("/api/create-customer", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
    }),
  });
  if (!response.ok) throw new Error("Unable to connect");
  const customerSubscriptionOrError = await response.json();
  return customerSubscriptionOrError;
}

export async function renameChart(id: number, name: string) {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("user_charts")
    .update({ name })
    .eq("id", id);
  if (error) throw error;
  return data;
}

export async function makeChartPublic(id: string, isPublic: boolean) {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("user_charts")
    .select("is_public,public_id")
    .eq("id", id);

  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Invalid Chart");
  const { is_public, public_id } = data[0];
  if (is_public === isPublic) return;

  let r;

  // Generate public id if not already set
  if (!public_id && isPublic) {
    let error: PostgrestError | null = {
      code: "23505",
      message: "Duplicate key value violates unique constraint",
      details: "",
      hint: "",
    };
    // If unique violation, generate a new public id
    let result;
    while (error?.code === "23505") {
      const publicId = await generatePublicId();
      result = await supabase
        .from("user_charts")
        .update({ public_id: publicId, is_public: isPublic })
        .eq("id", id);
      error = result.error;
    }

    if (error) throw error;
    r = result?.data;
  } else {
    // Just update is_public
    const result = await supabase
      .from("user_charts")
      .update({ is_public: isPublic })
      .eq("id", id);
    if (result.error) throw result.error;
    r = result.data;
  }

  return r;
}
async function generatePublicId(): Promise<string> {
  const response = await fetch("/api/generate-public-id", {
    mode: "cors",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
  });
  return response.json();
}

export async function getPublicChart(publicId: string) {
  if (!publicId) return;
  const { data, error } = await fetch(`/api/public?id=${publicId}`).then(
    (result) => result.json()
  );
  if (error) throw error;
  if (!data) throw new Error("Invalid Chart");
  return data;
}

export function usePublicChart(publicId?: string) {
  return useQuery(
    ["publicChart", publicId],
    () => {
      if (publicId) return getPublicChart(publicId);
    },
    {
      enabled: Boolean(publicId),
      refetchOnMount: true,
      staleTime: 0,
      suspense: true,
    }
  );
}

async function fetchDocs() {
  const { data, error } = await fetch("/api/docs").then((result) =>
    result.json()
  );
  if (error) throw error;
  return data;
}

export function useDocs() {
  return useQuery(["docs"], fetchDocs, {
    enabled: true,
    refetchOnMount: false,
    staleTime: 0,
    suspense: true,
  });
}

export function useAppMode() {
  return useQuery<UserSettings["mode"]>(
    ["appMode"],
    () => {
      const settings = JSON.parse(
        window.localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY) ?? "{}"
      );
      return typeof settings.mode == null
        ? window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : settings.mode;
    },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 0,
      suspense: true,
    }
  );
}
