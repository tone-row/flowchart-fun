import { useStripe } from "@stripe/react-stripe-js";
import { StripeElements } from "@stripe/stripe-js";
import { WarningCircle } from "phosphor-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";

import { useSession } from "../lib/hooks";
import { SectionTitle } from "../ui/Typography";
import { Warning } from "./Warning";

/**
 * This component allows the user to select a plan,
 * enter their email if they are not logged in,
 * and enter their payment information.
 */
export function PaymentStepper() {
  const session = useSession();
  const sessionEmail = session?.user?.email;
  const [plan, setPlan] = useState<null | "yearly" | "monthly">(() => {
    return window.location.hash === "#annually" ? "yearly" : null;
  });
  const [confirmPlan, setConfirmPlan] = useState(false);

  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState(false);

  const subscriptionDetails = useQuery(
    ["subscriptionDetails", email, plan],
    () => plan && getSubscriptionDetails(email, plan),
    {
      enabled: Boolean(confirmEmail && plan && email),
      retry: false,
      onError: () => {
        setConfirmEmail(false);
      },
    }
  );

  /**
   * watch the session email and if the user is logged in auto-fill this step!
   */
  useEffect(() => {
    if (sessionEmail) {
      setEmail(sessionEmail);
      setConfirmEmail(true);
    }
  }, [sessionEmail]);

  let step = "one";
  if (confirmPlan) step = "two";
  if (
    subscriptionDetails.data?.subscriptionId &&
    subscriptionDetails.data?.clientSecret
  )
    step = "three";

  return (
    <div className="grid justify-center gap-4">
      {step === "one" && (
        <>
          <SectionTitle className="text-center">Choose a plan!</SectionTitle>
          <div className="flex justify-center">
            <button
              aria-current={plan === "monthly" ? "true" : "false"}
              onClick={() => setPlan("monthly")}
              className="mr-2 aria-[current=true]:text-blue-500"
            >
              Monthly
            </button>
            <button
              aria-current={plan === "yearly" ? "true" : "false"}
              onClick={() => setPlan("yearly")}
              className="aria-[current=true]:text-blue-500"
            >
              Yearly
            </button>
          </div>
          {plan && (
            <button
              onClick={() => setConfirmPlan(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Continue
            </button>
          )}
        </>
      )}
      {step === "two" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const email = new FormData(e.target as HTMLFormElement).get(
              "email"
            ) as string;
            setEmail(email);
            setConfirmEmail(true);
          }}
          className="grid gap-2"
        >
          <SectionTitle className="text-center">Enter your email</SectionTitle>
          <p>Note: Make sure you use the same email you will use to log in</p>
          <input
            type="email"
            name="email"
            className="border border-gray-300 rounded px-2 py-1"
            required
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={subscriptionDetails.isLoading}
          >
            {subscriptionDetails.isLoading ? "Loading..." : "Continue"}
          </button>
          {subscriptionDetails.error && (
            <div>{(subscriptionDetails.error as Error).message}</div>
          )}
        </form>
      )}
      {step === "three" && (
        <PaymentForm
          clientSecret={subscriptionDetails.data?.clientSecret || ""}
        />
      )}
    </div>
  );
}

function PaymentForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useRef<StripeElements | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    if (!stripe) return;
    const options = {
      clientSecret,
      // Fully customizable with appearance API.
    };

    elements.current = stripe.elements(options);
    const paymentElement = elements.current.create("payment");
    paymentElement?.mount("#payment-element");
  }, [clientSecret, stripe]);

  async function signup() {
    if (!stripe || !elements.current) return;

    setLoading(true);

    const returnUrl = `${window.location.origin}/l#success`;

    const { error } = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements: elements.current,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setError(error.message ?? `An unknown error occurred`);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  }

  return (
    <form
      id="payment-form"
      className="grid gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        signup().finally(() => setLoading(false));
      }}
    >
      <div id="payment-element" />
      <button
        id="submit"
        disabled={!stripe || loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Subscribe
      </button>
      {error && (
        <Warning>
          <div className="flex items-center justify-start gap-2">
            <WarningCircle />
            <span className="text-xs">{error}</span>
          </div>
        </Warning>
      )}
    </form>
  );
}

/**
 * Creates incomplete subscription and returns client secret needed to complete it
 */
async function getSubscriptionDetails(
  email: string,
  plan: "monthly" | "yearly"
): Promise<{
  subscriptionId: string;
  clientSecret: string;
}> {
  // hit some api endpoint to get the payment details
  const response = await fetch("/api/get-signup-client-secret", {
    method: "POST",
    body: JSON.stringify({ email, plan }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  console.log("response", response);

  // if there is an error, throw it
  if (response.error) throw new Error(response.error.message);

  // return the payment token
  return response;
}
