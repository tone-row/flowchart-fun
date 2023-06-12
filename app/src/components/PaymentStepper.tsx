import { useAutoAnimate } from "@formkit/auto-animate/react";
import { t, Trans } from "@lingui/macro";
import { useStripe } from "@stripe/react-stripe-js";
import {
  StripeElements,
  StripeElementsOptionsClientSecret,
} from "@stripe/stripe-js";
import { ArrowRight, RocketLaunch, WarningCircle } from "phosphor-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";

import { useLightOrDarkMode, useSession } from "../lib/hooks";
import { BlueButton } from "../ui/BlueButton";
import Spinner from "./Spinner";
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
  const [parent] = useAutoAnimate();

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
    <div
      className="grid justify-center px-4 gap-4 pt-12 pb-16 z-10 overflow-hidden max-w-[560px] mx-auto"
      ref={parent}
    >
      {step === "one" && (
        <>
          <Title>
            <Trans>Select your plan!</Trans>
          </Title>
          <Description>
            {t`Choose the plan that's right for you and start creating amazing flowcharts with Flowchart Fun Pro`}
          </Description>
          <div className="grid items-center content-center justify-center gap-4 mt-6 md:grid-flow-col md:items-stretch">
            <PlanButton
              aria-current={plan === "monthly" ? "true" : "false"}
              onClick={() => setPlan("monthly")}
              className="mr-2 aria-[current=true]:text-blue-500"
              title={t`Monthly`}
              price={t`$3 per month`}
              data-testid="monthly-plan-button"
            />
            <PlanButton
              aria-current={plan === "yearly" ? "true" : "false"}
              onClick={() => setPlan("yearly")}
              className="aria-[current=true]:text-blue-500"
              title={t`Yearly`}
              price={t`$30 per year`}
              data-testid="yearly-plan-button"
              extra={
                <span className="text-xs text-neutral-800 p-2 justify-self-center bg-yellow-300 rounded font-bold mt-2 dark:bg-green-800/50 dark:text-neutral-50">
                  <Trans>Save 20% (2 months free!)</Trans>
                </span>
              }
            />
          </div>
          <BlueButton
            onClick={() => setConfirmPlan(true)}
            disabled={plan === null}
            className="mt-2 justify-self-center"
          >
            <Trans>Continue</Trans>
            <ArrowRight size={16} />
          </BlueButton>
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
          autoComplete="false"
          className="grid gap-4"
        >
          <Title>
            <Trans>Enter your email</Trans>
          </Title>
          <Description>{t`Let's get started! Enter your email address below to create your Flowchart Fun account and start using our powerful features.`}</Description>
          <div className="grid gap-2">
            <p className={`text-[13px] justify-self-center text-neutral-600`}>
              {t`Make sure you use the same email you will use to log in.`}
            </p>
            <input
              type="email"
              name="email"
              data-testid="email-input"
              className="border border-neutral-400 font-mono rounded p-4 max-w-[360px] w-full justify-self-center focus:outline-none focus:border-blue-500 dark:border-neutral-700 dark:focus:border-blue-500 dark:bg-neutral-800/50 dark:text-neutral-50"
              autoComplete="off"
              required
            />
          </div>
          <BlueButton
            disabled={subscriptionDetails.isLoading}
            className="mt-2 justify-self-center"
          >
            {subscriptionDetails.isLoading ? (
              <>
                {t`Loading`}
                <Spinner r={5} s={1} />
              </>
            ) : (
              <>
                {t`Continue`}
                <ArrowRight size={16} />
              </>
            )}
          </BlueButton>
          {subscriptionDetails.error && (
            <div className="justify-self-center">
              <Warning>{(subscriptionDetails.error as Error).message}</Warning>
            </div>
          )}
        </form>
      )}
      {step === "three" && (
        <div className="grid gap-4">
          <Title>{t`Activate your account`}</Title>
          <Description className="mb-4">
            <Trans>
              You&apos;re almost there! Just one more step to unlock the full
              potential of <span>Flowchart Fun Pro</span>. Enter your payment
              details below to complete your subscription and start creating
              amazing flowcharts today.
            </Trans>
          </Description>
          <PaymentForm
            clientSecret={subscriptionDetails.data?.clientSecret || ""}
          />
        </div>
      )}
    </div>
  );
}

function PlanButton({
  title,
  price,
  extra = null,
  ...props
}: {
  title: string;
  price: string;
  extra?: React.ReactNode;
} & React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="border w-[260px] border-solid p-4 py-12 grid gap-2 rounded-lg content-start border-b-4 border-neutral-700 dark:border-neutral-400 focus:outline-none aria-[current=true]:scale-105 transition-transform aria-[current=true]:border-blue-600 aria-[current=true]:dark:border-blue-600 text-neutral-800 dark:text-neutral-300 aria-[current=true]:text-blue-600 aria-[current=true]:dark:text-blue-600 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-neutral-800/50 aria-[current=true]:hover:shadow-none"
    >
      <h2 className={`text-xl font-bold`}>{title}</h2>
      <span className="text-xl">{price}</span>
      {extra}
    </button>
  );
}

function PaymentForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useRef<StripeElements | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const mode = useLightOrDarkMode();

  useEffect(() => {
    if (!stripe) return;
    const options: StripeElementsOptionsClientSecret = {
      clientSecret,
      appearance: {
        theme: mode === "dark" ? "night" : undefined,
        variables: {
          colorPrimary: "#5c6fff",
          colorPrimaryText: "#ffffff",
        },
      },
    };

    elements.current = stripe.elements(options);
    const paymentElement = elements.current.create("payment");
    paymentElement?.mount("#payment-element");
  }, [clientSecret, mode, stripe]);

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
      <BlueButton
        id="submit"
        disabled={!stripe || loading}
        className="mt-5 justify-self-center"
      >
        <Trans>Sign Up</Trans>
        {loading ? <Spinner r={5} s={1} /> : <RocketLaunch size={18} />}
      </BlueButton>
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

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-center text-3xl font-bold text-neutral-800 dark:text-neutral-200 text-wrap-balance">
      {children}
    </h2>
  );
}

function Description({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-center text-neutral-600 dark:text-neutral-400 leading-normal ${className}`}
    >
      {children}
    </p>
  );
}
