import { t, Trans } from "@lingui/macro";
import * as Dialog from "@radix-ui/react-dialog";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { ArrowSquareOut } from "phosphor-react";
import React, { ReactNode, useCallback, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { useHistory } from "react-router-dom";
const customerPortalLink = process.env.REACT_APP_STRIPE_CUSTOMER_PORTAL ?? "";

import { AppContext } from "../components/AppContext";
import Loading from "../components/Loading";
import { formatCents, formatDate } from "../lib/helpers";
import {
  createSubscription,
  queryClient,
  useOrderHistory,
} from "../lib/queries";
import { supabase } from "../lib/supabaseClient";
import { Box } from "../slang";
import { Content, Overlay } from "../ui/Dialog";
import { Button2, Input, Notice, Page, Section } from "../ui/Shared";
import { Description, Label, PageTitle, SectionTitle } from "../ui/Typography";
import styles from "./Account.module.css";

export default function Account() {
  const { customer, session, customerIsLoading } = useContext(AppContext);
  const [cancelModal, setCancelModal] = useState(false);
  const [resumeModal, setResumeModal] = useState(false);
  const { push } = useHistory();
  const signOut = useCallback(() => {
    (async () => {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      queryClient.removeQueries(["auth"]);
      push("/");
    })();
  }, [push]);
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
      {subscription?.status === "canceled" && (
        <Section>
          <SectionTitle>
            <Trans>Upgrade to Pro</Trans>
          </SectionTitle>
          <p className="text-sm leading-normal">
            <Trans>
              Your subscription is no longer active. If you want to create and
              edit permanent charts upgrade to Pro.
            </Trans>
          </p>
          <BecomeASponsor />
        </Section>
      )}
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
          <Box flow="column" content="start" gap={4}>
            <Notice>
              <Trans>Subscription will end</Trans>{" "}
              {formatDate(subscription.current_period_end.toString())}
            </Notice>
            <ConfirmResume isOpen={resumeModal} onOpenChange={setResumeModal}>
              <Button2 onClick={() => setResumeModal(true)}>
                <Trans>Resume Subscription</Trans>
              </Button2>
            </ConfirmResume>
          </Box>
        )}
      </Section>
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
      {customerPortalLink && (
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
      )}
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
  const { customer } = useContext(AppContext);
  async function cancelSubscription() {
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
  }
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Overlay />
      <Content>
        <p className="text-sm leading-normal">
          <Trans>Do you want to cancel your subscription?</Trans>
        </p>
        <div className="flex justify-between mt-4">
          <Button2 onClick={() => onOpenChange(false)} disabled={loading}>
            <Trans>Return</Trans>
          </Button2>
          <Button2
            disabled={loading}
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

function BecomeASponsor() {
  const stripe = useStripe();
  const elements = useElements();
  const { customer, theme } = useContext(AppContext);
  const { handleSubmit } = useForm();
  const submit = useMutation("becomeASponsor", async () => {
    if (!stripe || !elements || !customer?.customerId) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) throw new Error("No Card Element Found");

    const { error: createPaymentError, paymentMethod } =
      await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });
    if (createPaymentError) throw createPaymentError;
    if (!paymentMethod) throw new Error("No Payment Method");
    const { error: createSubscriptionError } = await createSubscription({
      customerId: customer.customerId,
      paymentMethodId: paymentMethod.id,
      subscriptionType: "monthly", // Need to fix this
    });
    if (createSubscriptionError) throw createSubscriptionError;
    queryClient.resetQueries(["auth"]);
  });
  return (
    <Box
      as="form"
      onSubmit={handleSubmit(() => submit.mutate())}
      template="none / minmax(0, 1fr) auto auto"
      content="normal start"
      flow="column"
      gap={2}
    >
      <Box p={2} px={3} rad={1} className={styles.CardEl}>
        <CardElement
          options={{
            style: {
              base: {
                color: theme.foreground,
                backgroundColor: theme.background,
                fontFamily:
                  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
                fontSize: "16px",
              },
            },
          }}
        />
      </Box>
      <Button2 type="submit" isLoading={submit.isLoading}>
        <Trans>Subscribe</Trans>
      </Button2>
    </Box>
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
