import { useContext, useState } from "react";
import { AppContext, useSession } from "./AppContextProvider";
import { useIsProUser } from "../lib/hooks";
import { Link } from "react-router-dom";
import Spinner from "./Spinner";
import { useMutation } from "react-query";
import { Trans, t } from "@lingui/macro";
import classNames from "classnames";
import { LockSimple, CreditCard, ArrowClockwise } from "phosphor-react";

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
  const { checkedSession, customerIsLoading } = useContext(AppContext);
  const isProUser = useIsProUser();
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");
  const createCheckoutSession = useMutation(
    async (plan: "monthly" | "yearly") => {
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
              className={classNames("font-bold hover:text-blue-500", {
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

  if (isProUser) {
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
              className={classNames("hover:text-blue-500 font-bold underline", {
                "hover:text-white": pricing2,
              })}
            >
              <Trans>Manage Subscription</Trans>
            </Link>
            <br />
            Have questions or feature requests?{" "}
            <Link
              to="/o"
              className={classNames("hover:text-blue-500 font-bold underline", {
                "hover:text-white": pricing2,
              })}
            >
              Let Us Know
            </Link>
          </Trans>
        </p>
      </div>
    );
  }

  return (
    <div className="grid">
      <h2 className="text-white text-lg font-medium sm:text-3xl text-center mb-10 text-wrap-balance leading-tight opacity-90">
        <Trans>
          Unlock AI Features and never lose your work with a Pro account.
        </Trans>
      </h2>
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        <PlanButton
          onClick={() => {
            setPlan("yearly");
          }}
          planTitle={t`Yearly`}
          description={t`Billed annually at $24`}
          data-testid="yearly-plan-button"
          monthlyPrice="2"
          aria-current={plan === "yearly"}
          data-session-activity="Choose Yearly Plan"
          save
        />
        <PlanButton
          onClick={() => {
            setPlan("monthly");
          }}
          planTitle={t`Monthly`}
          description={t`Billed monthly at $4`}
          data-testid="monthly-plan-button"
          monthlyPrice="4"
          aria-current={plan === "monthly"}
          data-session-activity="Choose Monthly Plan"
        />
      </div>

      <button
        className={classNames(
          "w-full bg-[#FFCD1F] text-black rounded-3xl text-[22px] font-bold py-6 shadow-md hover:bg-[#FFE063] hover:shadow-lg transition-all duration-300",
          {
            "animate-pulse": createCheckoutSession.isLoading,
          }
        )}
        onClick={() => {
          createCheckoutSession.mutate(plan);
        }}
        data-session-activity="Upgrade Account"
      >
        <Trans>
          {createCheckoutSession.isLoading
            ? t`Processing...`
            : t`Get Pro Access Now`}
        </Trans>
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
    </div>
  );
}

type PlanButtonProps = {
  planTitle: string;
  description: string;
  monthlyPrice: string;
  save?: boolean;
} & React.ComponentProps<"button">;

function PlanButton({
  planTitle,
  description,
  monthlyPrice,
  save,
  ...props
}: PlanButtonProps) {
  return (
    <button
      className="plan-button group w-full bg-white text-black rounded-3xl p-4 sm:py-5 sm:px-6 sm:h-[210px] grid content-start border-[4px] border-solid border-purple-700 relative aria-[current=true]:border-purple-700 transition-all aria-[current=false]:hover:opacity-100 opacity-80 aria-[current=true]:opacity-100"
      {...props}
    >
      <span className="text-lg font-bold justify-self-start mb-2 sm:mb-6">
        {planTitle}
      </span>
      <div className="flex items-baseline justify-center gap-2 mb-7">
        <span className="text-5xl font-extrabold">${monthlyPrice}</span>
        <span className="text-2xl font-bold -translate-y-[4px] -mr-px">/</span>
        <span className="text-xl font-bold">
          <Trans>month</Trans>
        </span>
      </div>
      <span className="opacity-50 text-[15px]">{description}</span>
      {save ? (
        <span className="absolute top-0 right-0 bg-purple-700 text-white font-bold pb-[14px] pt-[8px] pl-[17px] pr-[9px] rounded-tr-2xl rounded-bl-3xl -mr-px">
          Save 50%
        </span>
      ) : null}
    </button>
  );
}
