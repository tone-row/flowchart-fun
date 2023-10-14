import { t, Trans } from "@lingui/macro";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowSquareOut, Warning } from "phosphor-react";
import React, {
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
const customerPortalLink = process.env.REACT_APP_STRIPE_CUSTOMER_PORTAL ?? "";

import { AppContext } from "../components/AppContextProvider";
import Loading from "../components/Loading";
import { formatCents, formatDate } from "../lib/helpers";
import { mail, queryClient, useOrderHistory } from "../lib/queries";
import { supabase } from "../lib/supabaseClient";
import { Box } from "../slang";
import { Content, Overlay } from "../ui/Dialog";
import { Button2, Input, Notice, Page, Section, Textarea } from "../ui/Shared";
import { Description, Label, PageTitle, SectionTitle } from "../ui/Typography";
import styles from "./Account.module.css";
import {
  useIsProUser,
  useSubscriptionStatusDisplay,
  useCanSalvageSubscription,
} from "../lib/hooks";

export default function Account() {
  const { customer, session, customerIsLoading } = useContext(AppContext);
  const [cancelModal, setCancelModal] = useState(false);
  const [resumeModal, setResumeModal] = useState(false);
  const navigate = useNavigate();
  const signOut = useCallback(() => {
    (async () => {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      queryClient.removeQueries(["auth"]);
      navigate("/");
    })();
  }, [navigate]);
  const { data: invoices = [] } = useOrderHistory(
    customer?.customerId,
    customer?.subscription?.id
  );
  const subscription = customer?.subscription;

  const changeEmail = useMutation((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    return (async () => {
      const currentEmail = session?.user?.email;
      if (!currentEmail) throw new Error("Not logged in");

      if (!supabase) throw new Error("Unknown Error");

      const form = event.target as HTMLFormElement;
      const email = (form.elements.namedItem("email") as HTMLInputElement)
        .value;
      const emailConfirm = (
        form.elements.namedItem("emailConfirm") as HTMLInputElement
      ).value;

      if (email !== emailConfirm) {
        throw new Error("Emails do not match");
      }

      // if email is the same, do nothing
      if (email.toLocaleLowerCase() === currentEmail.toLocaleLowerCase()) {
        throw new Error("Email is the same");
      }

      // update the email in supabase
      const { error } = await supabase.auth.updateUser({ email });

      if (error) throw error;

      // update the email in stripe using our endpoint
      const result = await fetch("/api/update-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldEmail: currentEmail,
          newEmail: email,
        }),
      }).then((res) => res.json());

      // if it fails, we'll just let the user know
      if (result.error) {
        throw new Error(result.error);
      }

      if (!("success" in result) || !result.success)
        throw new Error("Failed to update email");

      const hash = `#message=${encodeURIComponent(
        "Respond to confirmation sent to old and new email address. You can close this window."
      )}`;

      window.location.hash = hash;
    })();
  });

  const isProUser = useIsProUser();

  if (customerIsLoading) return <Loading />;

  return (
    <Page>
      <PageTitle className="text-center">
        <Trans>Account</Trans>
      </PageTitle>
      <Section>
        <SectionTitle>
          <Trans>User</Trans>
        </SectionTitle>
        <Description>{session?.user?.email}</Description>
        <Button2 onClick={signOut} className="justify-self-start">
          <Trans>Log Out</Trans>
        </Button2>
      </Section>
      {isProUser ? (
        <Section>
          <SectionTitle>
            <Trans>One-on-One Support</Trans>
          </SectionTitle>
          <p className="text-neutral-500 text-sm">
            <Trans>
              Have complex questions or issues? We&apos;re here to help.
            </Trans>
          </p>
          <a
            className="flex gap-2 text-xs text-blue-500 items-center"
            href="https://calendly.com/tone-row/flowchart-fun"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>
              <Trans>Book a Meeting</Trans>
            </span>
            <ArrowSquareOut size={16} />
          </a>
        </Section>
      ) : null}
      {isProUser ? (
        <Section>
          <SectionTitle>
            <Trans>Subscription</Trans>
          </SectionTitle>
          <div className="grid gap-5">
            <div className="grid gap-1">
              <Label size="xs">
                <Trans>Status</Trans>
              </Label>
              <InfoCell className="uppercase">{subscription?.status}</InfoCell>
            </div>
            {subscription?.current_period_end &&
              !subscription?.cancel_at_period_end &&
              subscription?.status === "active" && (
                <div className="grid gap-1">
                  <Label size="xs">
                    <Trans>Next charge</Trans>
                  </Label>
                  <InfoCell>
                    {formatDate(subscription?.current_period_end.toString())}
                  </InfoCell>
                </div>
              )}
            {!subscription?.cancel_at_period_end &&
              subscription?.created &&
              subscription?.status === "active" && (
                <div className="grid gap-1">
                  <Label size="xs">
                    <Trans>Start</Trans>
                  </Label>
                  <InfoCell>
                    {formatDate(subscription.created.toString())}
                  </InfoCell>
                </div>
              )}
          </div>
          {subscription?.cancel_at_period_end && (
            <div className="flex gap-4 justify-start items-center">
              <Notice>
                <Trans>Subscription will end</Trans>{" "}
                {formatDate(subscription.current_period_end.toString())}
              </Notice>
              <ConfirmResume isOpen={resumeModal} onOpenChange={setResumeModal}>
                <Button2 onClick={() => setResumeModal(true)}>
                  <Trans>Resume Subscription</Trans>
                </Button2>
              </ConfirmResume>
            </div>
          )}
        </Section>
      ) : (
        <SubscriptionOptions />
      )}
      <Section>
        <SectionTitle>
          <Trans>Update Email</Trans>
        </SectionTitle>
        <Box as="form" gap={2} items="start" onSubmit={changeEmail.mutate}>
          <Input
            type="email"
            name="email"
            required
            placeholder={t`New Email`}
            disabled={changeEmail.isLoading}
          />
          <Input
            type="email"
            name="emailConfirm"
            required
            placeholder={t`Confirm New Email`}
            disabled={changeEmail.isLoading}
          />
          <Button2
            type="submit"
            disabled={changeEmail.isLoading}
            className="justify-self-start"
          >
            <Trans>Change Email Address</Trans>
          </Button2>
          {changeEmail.isError && (
            <Notice>{(changeEmail.error as Error).message}</Notice>
          )}
        </Box>
      </Section>
      {isProUser && customerPortalLink ? (
        <Section>
          <SectionTitle>
            <Trans>Customer Portal</Trans>
          </SectionTitle>
          <p className="text-neutral-500 text-sm">
            <Trans>
              Use the customer portal to change your billing information.
            </Trans>
          </p>
          <a
            href={customerPortalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-2 text-xs text-blue-500"
          >
            <span>
              <Trans>Open Customer Portal</Trans>
            </span>
            <ArrowSquareOut size={16} />
          </a>
        </Section>
      ) : null}
      {isProUser ? (
        <Section>
          <SectionTitle>
            <Trans>History</Trans>
          </SectionTitle>
          <Box as="table" className={styles.InvoicesTable} rad={1}>
            <colgroup>
              <col width="50%" />
              <col width="50%" />
            </colgroup>
            <thead>
              <tr>
                <Td>
                  <Trans>Date</Trans>
                </Td>
                <Td>
                  <Trans>Amount</Trans>
                </Td>
              </tr>
            </thead>
            <tbody>
              {invoices &&
                invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <Td className="whitespace-nowrap">
                      {formatDate(invoice.created.toString())}
                    </Td>
                    <Td>{formatCents(invoice.amount_paid)}</Td>
                  </tr>
                ))}
            </tbody>
          </Box>
        </Section>
      ) : null}
      {!subscription?.cancel_at_period_end &&
        subscription?.created &&
        subscription?.status === "active" && (
          <Section>
            <SectionTitle>
              <Trans>Cancel</Trans>
            </SectionTitle>
            <p className="text-sm leading-normal">
              <Trans>
                Cancel your subscription. Your hosted charts will become
                read-only.
              </Trans>
            </p>
            <ConfirmCancel isOpen={cancelModal} onOpenChange={setCancelModal}>
              <Button2
                onClick={() => setCancelModal(true)}
                className="justify-self-start"
              >
                <Trans>Cancel</Trans>
              </Button2>
            </ConfirmCancel>
          </Section>
        )}
    </Page>
  );
}

const Td = ({
  children,
  className = "",
  typeClasses = "",
}: {
  children: ReactNode;
  className?: string;
  typeClasses?: string;
}) => (
  <Box
    as="td"
    px={3}
    py={2}
    display="table-cell"
    className={`${styles.TableCell} ${className}`}
  >
    <span className={`text-xs ${typeClasses}`}>{children}</span>
  </Box>
);

function ConfirmCancel({
  isOpen,
  onOpenChange,
  children,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const { customer, session } = useContext(AppContext);
  const email = session?.user?.email;

  async function cancelSubscription() {
    if (!email) return;
    if (customer?.subscription) {
      setLoading(true);
      await fetch("/api/cancel-subscription", {
        method: "post",
        body: JSON.stringify({ subscriptionId: customer.subscription.id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      queryClient.invalidateQueries(["auth", "customerInfo"]);
      setLoading(false);
      onOpenChange(false);
    }
    mail({
      from: email,
      to: process.env.REACT_APP_FEEDBACK_TO as string,
      subject: "Flowchart Fun Cancel Subscription",
      text: "Reason for canceling: " + reason,
    });
  }

  const [reason, setReason] = useState("");
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Overlay />
      <Content maxWidthClass="max-w-[500px]">
        <h2 className="text-lg font-bold">Cancel Subscription</h2>
        <p className="text-xs leading-normal">
          <Trans>
            We're sorry to hear that you're considering canceling your
            subscription. Please let us know why you're canceling so we can
            improve our service. Thank you!
          </Trans>
        </p>
        <Textarea
          placeholder={t`Product is too expensive...`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="p-1 h-[160px]"
        />
        <div className="flex justify-between mt-4">
          <Button2 onClick={() => onOpenChange(false)} disabled={loading}>
            <Trans>Return</Trans>
          </Button2>
          <Button2
            disabled={loading || !reason}
            onClick={cancelSubscription}
            color="red"
            isLoading={loading}
          >
            <Trans>Cancel</Trans>
          </Button2>
        </div>
      </Content>
    </Dialog.Root>
  );
}

function ConfirmResume({
  isOpen,
  onOpenChange,
  children,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const { customer } = useContext(AppContext);
  if (!customer?.subscription?.current_period_end) return null;
  const period = customer.subscription.current_period_end.toString();
  async function resumeSubscription() {
    setLoading(true);
    await fetch("/api/resume-subscription", {
      method: "post",
      body: JSON.stringify({ subscriptionId: customer?.subscription?.id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    queryClient.invalidateQueries(["auth", "customerInfo"]);
    setLoading(false);
    onOpenChange(false);
  }
  return (
    <Dialog.Root
      aria-label={t`Resume Subscription`}
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <Dialog.Trigger>{children}</Dialog.Trigger>
      <Overlay />
      <Content>
        <p className="text-sm leading-normal">
          <Trans>Resume Subscription</Trans>
          <br />
          <Trans>Next charge</Trans> {formatDate(period)}.
        </p>
        <Box content="normal space-between" flow="column" gap={3}>
          <Button2 onClick={() => onOpenChange(false)} disabled={loading}>
            <Trans>Cancel</Trans>
          </Button2>
          <Button2
            disabled={loading}
            onClick={resumeSubscription}
            color="blue"
            isLoading={loading}
          >
            <Trans>Resume Subscription</Trans>
          </Button2>
        </Box>
      </Content>
    </Dialog.Root>
  );
}

function InfoCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`text-sm mt-1 ${className}`}>{children}</p>;
}

/**
 * Upgrade to Pro
 * A friendly notice that the user should upgrade to a subscription.
 * That they will need one after August 28th. That they can learn more
 * from our blog post. To learn more about Pro Features on our pricing page.
 */
function SubscriptionOptions() {
  const canSalvageSubscription = useCanSalvageSubscription();
  const statusDisplay = useSubscriptionStatusDisplay();
  const returnUrl = useMemo(() => window.location.href, []);
  const customerId = useContext(AppContext).customer?.customerId;
  const manageBillingMutation = useMutation(
    async () => {
      // Post to /api/create-customer-portal-session
      const response = await fetch("/api/create-customer-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId, returnUrl }),
      });

      const { url } = await response.json();

      return url;
    },
    {
      onSuccess: (url) => {
        // Redirect to the url
        window.location.href = url;
      },
    }
  );

  return (
    <Section>
      <SectionTitle>Subscription</SectionTitle>
      <div className="grid gap-4">
        {canSalvageSubscription ? (
          <div className="grid gap-4 justify-start justify-items-start">
            <p className="flex items-center gap-2">
              <Warning className="w-5 h-5" />
              <span>
                <Trans>
                  Your subscription is{" "}
                  <span className="lowercase">{statusDisplay}</span>.
                </Trans>
              </span>
            </p>
            <form method="POST" action="/api/create-customer-portal-session">
              <Button2
                color="blue"
                onClick={() => {
                  manageBillingMutation.mutate();
                }}
                isLoading={manageBillingMutation.isLoading}
              >
                <Trans>Manage Billing</Trans>
              </Button2>
            </form>
            <p>
              <Trans>
                Or, you can{" "}
                <Link to="/pricing" className="underline underline-offset-2">
                  create a new subscription
                </Link>
                .
              </Trans>
            </p>
          </div>
        ) : (
          <>
            <Trans>
              <p className="text-sm leading-normal">
                You currently have a free account.
                <br />
                <Link to="/pricing" className="text-blue-500">
                  Learn about our Pro Features and subscribe on our pricing page
                </Link>
                .
              </p>
            </Trans>
          </>
        )}
      </div>
    </Section>
  );
}
