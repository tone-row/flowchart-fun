import { t, Trans } from "@lingui/macro";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";

import { isError } from "../lib/helpers";
import { createCustomer, createSubscription } from "../lib/queries";
import { supabase } from "../lib/supabaseClient";
import { Box, Type } from "../slang";
import { AppContext } from "./AppContext";
import { LoginForm } from "./LoginForm";
import { Button, Input, Notice, Page, Section, SectionTitle } from "./Shared";
import Spinner from "./Spinner";
import styles from "./Sponsor.module.css";
import { SponsorDashboard } from "./SponsorDashboard";

export default function Sponsor() {
  const { session } = useContext(AppContext);

  if (session) return <SponsorDashboard />;

  return (
    <Page className={styles.Page} px={5}>
      <Box
        content="start normal"
        items="start stretch"
        rowGap={4}
        at={{
          tablet: { template: "auto / minmax(0, 1fr) minmax(0, 1fr)", pt: 8 },
        }}
      >
        <Box pt={4} px={4}>
          <LoginForm />
        </Box>
        <Section
          content="start normal"
          className={styles.SponsorBlock}
          p={4}
          rad={2}
        >
          <SectionTitle color="palette-purple-0" weight="700">
            <Trans>Become a Sponsor</Trans>
          </SectionTitle>
          <Type>
            <Trans>
              Sponsor flowchart.fun for $1 a month to access hosted flowcharts
              and the newest styles and features
            </Trans>
          </Type>
          <SignUpForm />
        </Section>
      </Box>
    </Page>
  );
}

function SignUpForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { register, handleSubmit } = useForm<{ email: string }>();
  const { theme } = useContext(AppContext);
  const [success, setSuccess] = useState(false);
  const create = useMutation(
    "createCustomer",
    async ({ email }: { email: string }) => {
      if (!stripe || !elements || !supabase) {
        // Stripe.js has not loaded yet. Make sure to disable
        // form submission until Stripe.js has loaded.
        return;
      }

      // get/create customer
      const {
        customer,
        subscription: earlySubscription,
        error,
      } = await createCustomer(email);
      if (error) throw error;

      if (earlySubscription) {
        throw new Error("Please try logging in.");
      }

      // Get a reference to a mounted CardElement. Elements knows how
      // to find your CardElement because there can only ever be one of
      // each type of element.
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("No Card Element Found");

      // Use your card Element with other Stripe.js APIs
      const { error: createPaymentError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

      if (createPaymentError) throw createPaymentError;
      if (!paymentMethod) throw new Error("No Payment Method");

      // create subscription
      const { error: createSubscriptionError } = await createSubscription({
        customerId: customer.id,
        paymentMethodId: paymentMethod.id,
      });

      if (createSubscriptionError) throw createSubscriptionError;

      // Send Sign In Link
      const { error: supabaseError } = await supabase.auth.signIn({
        email,
      });
      if (supabaseError) throw supabaseError;
    },
    {
      onSuccess: () => {
        setSuccess(true);
      },
    }
  );

  return success ? (
    <div>
      <Trans>
        Check your email for a link to log in. You can close this window.
      </Trans>
    </div>
  ) : (
    <Box
      as="form"
      gap={2}
      pt={3}
      onSubmit={handleSubmit((data) => create.mutate(data))}
    >
      <Input
        className={styles.SponsorFormInput}
        type="email"
        placeholder="Email"
        {...register("email", {
          required: true,
          setValueAs: (t) => t.toLowerCase(),
        })}
      />
      <Box p={3} background="palette-white-0" rad={1}>
        <CardElement
          options={{
            style: {
              base: {
                color: theme.foreground,
                backgroundColor: "#ffffff",
                fontFamily:
                  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
                fontSize: "16px",
              },
            },
          }}
        />
      </Box>
      <Button type="submit" text={t`Sign Up`} className={styles.SignUpButton} />
      <Box template="auto / auto auto" content="normal space-between">
        <Type size={-2} as="span">
          <Trans>We use cookies to keep you logged in.</Trans>
        </Type>
        {create.isLoading && (
          <Spinner r={14} s={2} c="var(--palette-purple-0)" />
        )}
      </Box>

      {create.error && (
        <Notice>
          <span
            dangerouslySetInnerHTML={{
              __html: isError(create.error) ? create.error.message : "",
            }}
          />
        </Notice>
      )}
    </Box>
  );
}
