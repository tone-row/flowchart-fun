import { PostgrestError } from "@supabase/supabase-js";
import { format, formatDistanceStrict, parseISO } from "date-fns";
import { useContext } from "react";
import { QueryClient, useQuery } from "react-query";
import Stripe from "stripe";

import { AppContext } from "../components/AppContextProvider";
import { getDefaultChart } from "./getDefaultChart";
import { supabase } from "./supabaseClient";

export const queryClient = new QueryClient();

queryClient.setDefaultOptions({
  queries: {
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  },
});

/**
 * Returns the customer id and subscription
 * for the logged in user
 */
async function customerInfo(): Promise<
  | {
      customerId: string;
      subscription?: Stripe.Subscription;
    }
  | undefined
> {
  try {
    if (!supabase) throw new Error("No supabase");
    const auth = await supabase.auth.getSession();
    if (!auth.data.session) throw new Error("No session");
    const accessToken = auth.data.session.access_token;
    const response = await fetch("/api/customer-info", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.json();
  } catch (error) {
    return undefined;
  }
}

/**
 * Useful stripe info– customer id and subscription
 */
export function useCustomerInfo() {
  return useQuery(["auth", "customerInfo"], customerInfo, {
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

type MakeChartArgs = {
  name: string;
  user_id: string;
  chart?: string;
} & (
  | { fromPrompt: true; prompt: string; method: "instruct" | "extract" }
  | { fromPrompt?: never; prompt?: never; method?: never }
  | { template: string; fromPrompt?: never; prompt?: never; method?: never }
);

export async function makeChart({
  name,
  user_id,
  chart,
  ...rest
}: MakeChartArgs) {
  if (!supabase) return;
  const defaultText = getDefaultChart();

  if ("fromPrompt" in rest && rest.fromPrompt) {
    // get supabase session
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new Error("No session");

    const accessToken = data.session.access_token;

    const response = await fetch(`/api/prompt/${rest.method}`, {
      method: "post",
      body: JSON.stringify({ prompt: rest.prompt }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if ("chart" in result) chart = result["chart"] as string;
  } else if ("template" in rest) {
    // get template here
    try {
      const template = await import(`./templates/${rest.template}-template.ts`);
      chart = template.default;
    } catch (error) {
      console.error(error);
    }
  }

  return await supabase
    .from("user_charts")
    .insert({ name, chart: chart ?? defaultText, user_id })
    .select();
}

export async function copyHostedChartById(id: number) {
  if (!supabase) return;
  // get current user
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) throw new Error("No session");
  const { data, error } = await supabase
    .from("user_charts")
    .select("name,chart")
    .eq("id", id);
  if (error) throw error;
  const chart = data?.[0];
  if (!chart) throw new Error("No chart found");

  const response = await makeChart({
    name: `Copy of ${chart.name}`,
    user_id: sessionData.session.user.id,
    chart: chart.chart,
  });

  if (!response) throw new Error("Unable to copy chart");
  if (response.error) throw response.error;

  return response.data[0];
}

async function userCharts() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("user_charts")
    .select("id,name,created_at,updated_at,is_public")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data.map((chart) => {
    const niceUpdatedDate = `Updated ${formatDistanceStrict(
      parseISO(chart.updated_at),
      new Date()
    )}`;
    // nice created date like "March 10th, 2004"
    const niceCreatedDate = format(parseISO(chart.created_at), "MMMM do, yyyy");
    return {
      ...chart,
      niceUpdatedDate,
      niceCreatedDate,
    };
  });
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

/**
 * Rename a hosted chart and clear the related cache
 */
export async function renameChart(id: number, name: string) {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("user_charts")
    .update({ name })
    .eq("id", id);
  if (error) throw error;
  // clear cache
  queryClient.invalidateQueries(["useHostedDoc", id.toString()]);
  return data;
}

export async function makeChartPublic(id: number, isPublic: boolean) {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("user_charts")
    .select("is_public,public_id")
    .eq("id", id);

  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Invalid Chart");

  const { is_public, public_id } = data[0];
  if (is_public === isPublic) return;

  const r = {
    isPublic,
    publicId: public_id,
  };

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
    let publicId = "";
    while (error?.code === "23505") {
      publicId = await generatePublicId();
      result = await supabase
        .from("user_charts")
        .update({ public_id: publicId, is_public: isPublic })
        .eq("id", id);
      error = result.error;
    }
    if (error) throw error;
    r.publicId = publicId;
  } else {
    // Just update is_public
    const result = await supabase
      .from("user_charts")
      .update({ is_public: isPublic })
      .eq("id", id);
    if (result.error) throw result.error;
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
