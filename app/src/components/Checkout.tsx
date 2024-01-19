import { useContext } from "react";
import { AppContext, useSession } from "./AppContextProvider";
import { useIsProUser } from "../lib/hooks";
import { Link } from "react-router-dom";
import Spinner from "./Spinner";
import { useMutation } from "react-query";
import { Trans, t } from "@lingui/macro";
import { PlanButton } from "./PlanButton";
import { PaymentStepperTitle } from "./PaymentStepperTitle";
import classNames from "classnames";

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
            You're already a Pro User!
            <br />
            Have questions or feature requests?
            <br />
            <Link
              to="/o"
              className={classNames("hover:text-blue-500", {
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
    <div className="relative h-full">
      <div
        className={classNames(
          "grid content-center h-full rounded-xl p-8 pb-16 bg-neutral-50 border dark:to-blue-900/50 dark:from-blue-900/0",
          {
            "opacity-60 pointer-events-none cursor-loading":
              createCheckoutSession.isLoading,
            "dark:bg-neutral-900 dark:border-none": pricing2,
          }
        )}
      >
        <PaymentStepperTitle className="mb-2">
          <Trans>Choose a Plan</Trans>
        </PaymentStepperTitle>
        <p className="text-center mb-4">
          <Trans>Try it for free for two days. Cancel anytime.</Trans>
        </p>
        <div className="w-full grid gap-2 h-full content-center">
          <PlanButton
            onClick={() => createCheckoutSession.mutate("monthly")}
            className="mr-2 aria-[current=true]:text-blue-500"
            title={t`Monthly`}
            price={t`$3 / month`}
            data-testid="monthly-plan-button"
          />
          <PlanButton
            onClick={() => createCheckoutSession.mutate("yearly")}
            className="aria-[current=true]:text-blue-500"
            title={t`Yearly`}
            price={t`$30 / year`}
            data-testid="yearly-plan-button"
            extra={
              <span className="!text-[14px] uppercase bg-yellow-300 py-2 px-3 text-neutral-900 rounded font-bold absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[22px] transform whitespace-nowrap transition-transform group-aria-pressed:scale-[1.1] group-aria-pressed:translate-y-[18px] group-aria-pressed:rotate-[3deg]">
                <Trans>16% Less</Trans>
              </span>
            }
          />
        </div>
      </div>
      {createCheckoutSession.isLoading ? (
        <Spinner className="text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      ) : null}
    </div>
  );
}
