import { ReactNode, useContext } from "react";
import { AppContext, useSession } from "./AppContextProvider";
import { useHasActivePass } from "../lib/hooks";
import { formatDate } from "../lib/helpers";
import { Link } from "react-router-dom";
import Spinner from "./Spinner";
import { useMutation } from "react-query";
import { Trans, t } from "@lingui/macro";
import classNames from "classnames";
import { LockSimple, CreditCard, ArrowClockwise } from "phosphor-react";
import { usePostHog } from "posthog-js/react";
import { PricingPlan, usePricingPlanStore } from "../lib/usePricingPlanStore";

export function Checkout({
  pricing2,
}: {
  /**
   * Is this the updated pricing page?
   */
  pricing2?: boolean;
}) {
  const session = useSession();
  const sessionEmail = session?.user?.email;
  const posthog = usePostHog();
  const { checkedSession, customerIsLoading, customer } =
    useContext(AppContext);
  // Deliberately keyed to the subscription, not useIsProUser(): a pass-only
  // holder should still be able to subscribe mid-pass (the pass never
  // renews, so there is no double-billing risk).
  const subStatus = customer?.subscription?.status;
  const subscriptionIsPro = Boolean(
    subStatus &&
      ["trialing", "active", "past_due", "unpaid"].includes(subStatus)
  );
  const hasActivePass = useHasActivePass();
  const { plan, setPlan } = usePricingPlanStore();
  // Single source of truth for what will be purchased. A pass holder can't
  // buy a second pass (there is no server-side guard against double
  // charging), so a stale "pass" selection falls back to yearly everywhere:
  // card highlight, CTA label, analytics, and the checkout request.
  const effectivePlan: PricingPlan =
    plan === "pass" && hasActivePass ? "yearly" : plan;
  const createCheckoutSession = useMutation(
    async (plan: PricingPlan) => {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          email: sessionEmail,
        }),
      });
      const { url, error } = await response.json();
      if (error) {
        throw new Error(error.message);
      }
      return url;
    },
    {
      onSuccess: (url) => {
        window.location.href = url;
      },
    }
  );

  if (!checkedSession) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  if (!sessionEmail) {
    // create search params with a redirectUrl to /pricing
    const searchParams = new URLSearchParams();
    searchParams.set("redirectUrl", window.location.href);

    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="grid justify-center justify-items-center">
          <p className="text-lg text-wrap-balance text-center leading-normal">
            <Link
              to={`/l?${searchParams.toString()}`}
              className={classNames("font-bold hover:text-purple-500", {
                "text-white hover:text-white text-xl hover:scale-105 transition-transform":
                  pricing2,
              })}
            >
              <Trans>Log in to upgrade your account</Trans>
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (customerIsLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-neutral-200">
        <Spinner />
      </div>
    );
  }

  if (subscriptionIsPro) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p
          className={classNames(
            "text-xl text-center text-wrap-balance leading-normal",
            {
              "text-white": pricing2,
            }
          )}
        >
          <Trans>
            You're already a Pro User.{" "}
            <Link
              to="/a"
              className={classNames(
                "hover:text-purple-500 font-bold underline",
                {
                  "hover:text-white": pricing2,
                }
              )}
            >
              <Trans>Manage Subscription</Trans>
            </Link>
            <br />
            Have questions or feature requests?{" "}
            <Link
              to="/o"
              className={classNames(
                "hover:text-purple-500 font-bold underline",
                {
                  "hover:text-white": pricing2,
                }
              )}
            >
              Let Us Know
            </Link>
          </Trans>
        </p>
      </div>
    );
  }

  const ctaLabel = createCheckoutSession.isLoading
    ? t`Processing...`
    : effectivePlan === "pass"
    ? t`Get a 30-Day Pass — $9`
    : t`Get Pro Access Now`;

  return (
    <div className="grid">
      <h2 className="text-white text-lg font-medium sm:text-3xl text-center mb-10 text-wrap-balance leading-tight opacity-90">
        <Trans>
          Unlock AI Features and never lose your work with a Pro account.
        </Trans>
      </h2>
      {hasActivePass && customer?.pass ? (
        <div className="mb-8 rounded-lg bg-white/15 text-white text-center text-sm py-3 px-4">
          <Trans>
            You have an active 30-Day Pass until{" "}
            {formatDate(customer.pass.expiresAt.toString())}. Want to keep Pro
            around? Subscribe below.
          </Trans>
        </div>
      ) : null}
      <div
        className={classNames("grid gap-3 mb-8", {
          "sm:grid-cols-3": !hasActivePass,
          "sm:grid-cols-2": hasActivePass,
        })}
      >
        <PlanButton
          onClick={() => {
            setPlan("yearly");
          }}
          planTitle={t`Yearly`}
          description={t`Billed annually at $24`}
          data-testid="yearly-plan-button"
          price="2"
          aria-current={effectivePlan === "yearly"}
          data-session-activity="Choose Yearly Plan"
          badge={{
            label: <Trans>Save 50%</Trans>,
            className: "bg-purple-700 text-white",
          }}
        />
        <PlanButton
          onClick={() => {
            setPlan("monthly");
          }}
          planTitle={t`Monthly`}
          description={t`Billed monthly at $4`}
          data-testid="monthly-plan-button"
          price="4"
          aria-current={effectivePlan === "monthly"}
          data-session-activity="Choose Monthly Plan"
        />
        {!hasActivePass ? (
          <PlanButton
            onClick={() => {
              setPlan("pass");
            }}
            planTitle={t`30-Day Pass`}
            description={t`One payment. Never renews.`}
            data-testid="pass-plan-button"
            price="9"
            unit={t`once`}
            aria-current={effectivePlan === "pass"}
            data-session-activity="Choose 30-Day Pass"
            badge={{
              label: <Trans>One-time</Trans>,
              className: "bg-[#FFCD1F] text-black",
            }}
          />
        ) : null}
      </div>

      <button
        className={classNames(
          "w-full bg-[#FFCD1F] text-black rounded-3xl text-[22px] font-bold py-6 shadow-md hover:bg-[#FFE063] hover:shadow-lg transition-all duration-300",
          {
            "animate-pulse": createCheckoutSession.isLoading,
          }
        )}
        onClick={() => {
          posthog.capture("checkout_started", { plan: effectivePlan });
          createCheckoutSession.mutate(effectivePlan);
        }}
        data-testid="checkout-button"
        data-session-activity={
          effectivePlan === "pass" ? "Get 30-Day Pass" : "Upgrade Account"
        }
      >
        {ctaLabel}
      </button>

      <div className="mt-8 text-base text-white bg-purple-600 rounded-lg p-5 shadow-md">
        <div className="flex items-center mb-2">
          <LockSimple className="mr-2" size={18} />
          <span>
            <Trans>Secure payment</Trans>
          </span>
        </div>
        <div className="flex items-center mb-2">
          <CreditCard className="mr-2" size={18} />
          <span>
            <Trans>Cancel anytime</Trans>
          </span>
        </div>
        <div className="flex items-center">
          <ArrowClockwise className="mr-2" size={18} />
          <span>
            <Trans>Satisfaction guaranteed or first payment refunded</Trans>
          </span>
        </div>
      </div>

      <p className="text-white/80 text-sm text-center mt-4 text-wrap-balance leading-normal">
        <Trans>
          Pass and subscription both unlock every Pro feature. When a pass ends,
          your charts are never deleted — hosted charts become read-only until
          you upgrade again.
        </Trans>
      </p>
    </div>
  );
}

type PlanButtonProps = {
  planTitle: string;
  description: string;
  /** Headline price in dollars, no symbol */
  price: string;
  /** Unit shown after the price. Defaults to "/ month". */
  unit?: string;
  /** Corner badge: label + bg/text color classes */
  badge?: { label: ReactNode; className: string };
} & React.ComponentProps<"button">;

function PlanButton({
  planTitle,
  description,
  price,
  unit,
  badge,
  ...props
}: PlanButtonProps) {
  return (
    <button
      className="plan-button group w-full bg-white text-black rounded-3xl p-4 sm:py-5 sm:px-6 sm:min-h-[210px] grid content-start border-[4px] border-solid border-purple-700 relative aria-[current=true]:border-purple-700 transition-all aria-[current=false]:hover:opacity-100 opacity-80 aria-[current=true]:opacity-100"
      {...props}
    >
      {/* mt clears the corner badge so titles never collide with it */}
      <span className="text-lg font-bold justify-self-start text-left leading-tight mt-1 mb-2 sm:mt-5 sm:mb-3">
        {planTitle}
      </span>
      <div className="flex items-baseline justify-center gap-2 mb-5">
        <span className="text-5xl font-extrabold">${price}</span>
        {unit ? (
          <span className="text-xl font-bold">{unit}</span>
        ) : (
          <>
            <span className="text-2xl font-bold -translate-y-[4px] -mr-px">
              /
            </span>
            <span className="text-xl font-bold">
              <Trans>month</Trans>
            </span>
          </>
        )}
      </div>
      <span className="opacity-50 text-[15px]">{description}</span>
      {badge ? (
        <span
          className={classNames(
            "absolute top-0 right-0 font-bold pb-[14px] pt-[8px] pl-[17px] pr-[9px] rounded-tr-2xl rounded-bl-3xl -mr-px",
            badge.className
          )}
        >
          {badge.label}
        </span>
      ) : null}
    </button>
  );
}
