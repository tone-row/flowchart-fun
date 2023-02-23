import { t, Trans } from "@lingui/macro";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "react-query";

import { AppContext } from "../components/AppContext";
import { Button, Input, Notice } from "../components/Shared";
import Spinner from "../components/Spinner";
import { isError } from "../lib/helpers";
import { createCustomer, createSubscription } from "../lib/queries";
import { logError } from "../lib/sentry";
import { supabase } from "../lib/supabaseClient";
import { Box, Type } from "../slang";
import styles from "./SignUpForm.module.css";

type SignUpFormData = {
  email: string;
  subscription: "monthly" | "yearly";
};

export function SignUpForm() {
  const stripe = useStripe();
  const elements = useElements();
  // check if hash === "#annually"
  const initialAnnually = window.location.hash === "#annually";
  const { register, handleSubmit, control } = useForm<SignUpFormData>({
    defaultValues: {
      subscription: initialAnnually ? "yearly" : "monthly",
      email: "",
    },
  });
  const { theme } = useContext(AppContext);
  const [success, setSuccess] = useState(false);
  const create = useMutation(
    "createCustomer",
    async ({ email, subscription }: SignUpFormData) => {
      if (!stripe || !elements || !supabase) {
        // Stripe.js has not loaded yet. Make sure to disable
        // form submission until Stripe.js has loaded.
        return;
      }

      // Get a reference to a mounted CardElement. Elements knows how
      // to find your CardElement because there can only ever be one of
      // each type of element.
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("No Card Element Found");

      // Test Payment Method
      const { error: createPaymentError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

      if (createPaymentError) throw createPaymentError;
      if (!paymentMethod) throw new Error("No Payment Method");

      // Create Customer
      const {
        customer,
        subscription: preexistingSubscription,
        error,
      } = await createCustomer(email);

      if (error) throw error;
      if (preexistingSubscription) {
        throw new Error("Please try logging in.");
      }

      // create subscription
      const { error: createSubscriptionError } = await createSubscription({
        customerId: customer.id,
        paymentMethodId: paymentMethod.id,
        subscriptionType: subscription,
      });

      if (createSubscriptionError) throw createSubscriptionError;

      // Send Sign In Link
      const { error: supabaseError } = await supabase.auth.signInWithOtp({
        email,
      });

      if (supabaseError) throw supabaseError;
    },
    {
      onSuccess: () => {
        setSuccess(true);
      },
      onError: (error) => {
        logError(error as Error);
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
      gap={3}
      pt={3}
      onSubmit={handleSubmit((data) => {
        create.mutate(data);
      })}
    >
      <Input
        className={styles.SponsorFormInput}
        type="email"
        data-testid="email"
        placeholder="Email"
        {...register("email", {
          required: true,
          setValueAs: (t) => t.toLowerCase(),
        })}
      />

      <Controller
        render={({ field }) => (
          <RadioGroup.Root
            value={field.value}
            onValueChange={(value) => field.onChange(value)}
          >
            <Box flow="column" gap={3}>
              {[
                { label: t`$3 / Month`, value: "monthly" },
                { label: t`$30 / Year`, value: "yearly" },
              ].map((el) => (
                <Box
                  as={RadioGroup.Item}
                  key={el.value}
                  value={el.value}
                  id={el.value}
                  className={styles.RadioButton}
                  p={3}
                  rad={1}
                >
                  <Type as="span" size={0} weight="700">
                    {el.label}
                  </Type>
                </Box>
              ))}
            </Box>
          </RadioGroup.Root>
        )}
        name="subscription"
        control={control}
        defaultValue="monthly"
      />
      <Box
        p={3}
        background="palette-white-0"
        rad={1}
        data-testid="card-element"
      >
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
      <Box gap={2}>
        <Button
          type="submit"
          text={t`Sign Up`}
          className={styles.SignUpButton}
          p={3}
          typeProps={{ size: 0 }}
        />
        <Box template="auto / auto auto" content="normal space-between">
          <Type size={-1} as="span" style={{ opacity: 0.5 }}>
            *<Trans>We use cookies to keep you logged in.</Trans>
          </Type>
          {create.isLoading && (
            <Spinner r={14} s={2} c="var(--palette-purple-0)" />
          )}
        </Box>
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
