import { ReactNode, useCallback, useContext, useState } from "react";
import { Box, Type, TypeProps } from "../slang";
import { Button, Dialog, Notice, Page, Section, SectionTitle } from "./Shared";
import styles from "./Login.module.css";
import { supabase } from "../supabaseClient";
import { AppContext } from "./AppContext";
import { formatCents, formatDate, formatRelative } from "../lib/helpers";
import classes from "./SponsorDashboard.module.css";
import Spinner from "./Spinner";
import {
  createSubscription,
  queryClient,
  useOrderHistory,
} from "../lib/queries";
import Loading from "./Loading";
import { t, Trans } from "@lingui/macro";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { useHistory } from "react-router";

export function SponsorDashboard() {
  const { customer, session, customerIsLoading } = useContext(AppContext);
  const [cancelModal, setCancelModal] = useState(false);
  const [resumeModal, setResumeModal] = useState(false);
  const { push } = useHistory();
  const signOut = useCallback(() => {
    (async () => {
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

  if (customerIsLoading) return <Loading />;

  return (
    <Page
      px={4}
      py={8}
      content="start normal"
      className={styles.Wrapper}
      self="stretch center"
    >
      <Section>
        <Type>Logged in as {session?.user?.email}</Type>
        <Button self="start" onClick={signOut} text={t`Log Out`} />
      </Section>
      {subscription?.status === "canceled" && (
        <Section>
          <SectionTitle>Become a Sponsor</SectionTitle>
          <Type>
            {t`Your subscription has ended. If you want to become a sponsor again
            sign up here.`}
          </Type>
          <BecomeASponsor />
        </Section>
      )}
      <Section>
        <SectionTitle>Subscription</SectionTitle>
        <Box template="auto / repeat(2, minmax(0, 1fr))" columnGap={6}>
          <Type size={-1}>Status</Type>
          <Type size={-1} style={{ textTransform: "capitalize" }}>
            {subscription?.status}
          </Type>
          {subscription?.current_period_end &&
            !subscription?.cancel_at_period_end &&
            subscription?.status === "active" && (
              <>
                <Type size={-1}>Next Payment Due</Type>
                <Type size={-1} style={{ textTransform: "capitalize" }}>
                  {formatDate(subscription?.current_period_end.toString())}
                </Type>
              </>
            )}
        </Box>
        {subscription?.cancel_at_period_end && (
          <Box flow="column" content="start" gap={4}>
            <Notice>
              <Trans>Subscription will cancel</Trans>{" "}
              {formatDate(subscription.current_period_end.toString())}
            </Notice>
            <Button
              onClick={() => setResumeModal(true)}
              text={t`Resume Subscription`}
            />
          </Box>
        )}

        {!subscription?.cancel_at_period_end &&
          subscription?.created &&
          subscription?.status === "active" && (
            <>
              <Type size={-1}>
                Thank you for being a flowchart.fun sponsor since{" "}
                {formatRelative(subscription.created.toString())}. You can
                cancel your subscription at anytime, and you will keep your
                persistent charts in a read-only state.
              </Type>
              <Button
                self="normal start"
                onClick={() => setCancelModal(true)}
                text={t`Cancel Subscription`}
              />
            </>
          )}
      </Section>
      <Section>
        <SectionTitle>History</SectionTitle>
        <Box as="table" className={classes.InvoicesTable} rad={1}>
          <colgroup>
            <col width="50%" />
            <col width="50%" />
          </colgroup>
          <thead>
            <tr>
              <Td typeProps={{ size: -1 }}>Date</Td>
              <Td typeProps={{ size: -1 }}>Amount Paid</Td>
            </tr>
          </thead>
          <tbody>
            {invoices &&
              invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <Td>{formatDate(invoice.created.toString())}</Td>
                  <Td>{formatCents(invoice.amount_paid)}</Td>
                </tr>
              ))}
          </tbody>
        </Box>
      </Section>
      <ConfirmCancel
        isOpen={cancelModal}
        onDismiss={() => setCancelModal(false)}
      />
      <ConfirmResume
        isOpen={resumeModal}
        onDismiss={() => setResumeModal(false)}
      />
    </Page>
  );
}

const Td = ({
  children,
  typeProps = {},
}: {
  children: ReactNode;
  typeProps?: TypeProps;
}) => (
  <Box as="td" px={3} py={2} display="table-cell" className={classes.TableCell}>
    <Type as="span" size={-1} {...typeProps}>
      {children}
    </Type>
  </Box>
);

function ConfirmCancel({
  isOpen,
  onDismiss,
}: {
  isOpen: boolean;
  onDismiss: () => void;
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
      onDismiss();
    }
  }
  return (
    <Dialog
      dialogProps={{
        isOpen,
        onDismiss,
        "aria-label": "Cancel Subscription",
      }}
      innerBoxProps={{ gap: 6 }}
    >
      <Type>Are you sure you want to cancel your subscription?</Type>
      <Box content="normal space-between" flow="column" gap={3}>
        <Button onClick={onDismiss} disabled={loading} text={t`Return`} />
        <Button
          disabled={loading}
          onClick={cancelSubscription}
          text={t`Cancel My Subscription`}
        />
      </Box>
      {loading && <Spinner />}
    </Dialog>
  );
}

function ConfirmResume({
  isOpen,
  onDismiss,
}: {
  isOpen: boolean;

  onDismiss: () => void;
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
    onDismiss();
  }
  return (
    <Dialog
      dialogProps={{ isOpen, onDismiss, "aria-label": "Resume Subscription" }}
      innerBoxProps={{ gap: 4 }}
    >
      <Type as="p">
        Would you like to resume your subscription?
        <br />
        Your next charge will be on {formatDate(period)}.
      </Type>
      <Box content="normal space-between" flow="column" gap={3}>
        <Button onClick={onDismiss} disabled={loading} text={t`Return`} />
        <Button
          disabled={loading}
          onClick={resumeSubscription}
          text={t`Resume My Subscription`}
        />
      </Box>
      {loading && <Spinner />}
    </Dialog>
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
    });
    if (createSubscriptionError) throw createSubscriptionError;
    window.location.reload();
  });
  return (
    <Box
      as="form"
      onSubmit={handleSubmit(() => submit.mutate())}
      template="none / auto minmax(0, 1fr) auto"
      content="normal start"
      flow="column"
      gap={2}
    >
      {submit.isLoading ? <Spinner /> : <div />}
      <Box p={2} px={3} rad={1} className={classes.CardEl}>
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
      <Button type="submit">Subscribe</Button>
    </Box>
  );
}
