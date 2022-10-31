import { t, Trans } from "@lingui/macro";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { ReactNode, useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "react-query";

import { isError } from "../lib/helpers";
import { createCustomer, createSubscription } from "../lib/queries";
import { supabase } from "../lib/supabaseClient";
import { Box, Type } from "../slang";
import { AppContext } from "./AppContext";
import { LoginForm } from "./LoginForm";
import { Button, Input, Notice, Section, SectionTitle } from "./Shared";
import Spinner from "./Spinner";
import styles from "./Sponsor.module.css";
import { SponsorDashboard } from "./SponsorDashboard";

export default function Sponsor() {
  const { session } = useContext(AppContext);

  if (session) return <SponsorDashboard />;

  return (
    <Box className={styles.Page} p={5} gap={10} pt={10}>
      <Type className={styles.PageTitle} size={1}>
        <Trans>
          Sponsor flowchart.fun for{" "}
          <Box as="span" className={styles.orange}>
            <Trans>$3 / month</Trans>
          </Box>{" "}
          or{" "}
          <Box as="span" className={styles.orange}>
            <Trans>$30 / year</Trans>
          </Box>{" "}
          to get access to...
        </Trans>
      </Type>
      <Box gap={10}>
        <ReasonToSubscribe
          alt="Hosted Charts"
          heading={<Trans>Hosted Charts</Trans>}
          imgSrc="/images/e.png"
        >
          <Trans>
            Edit your charts on any device. Share them with anyone. Publish your
            charts once and they remain up to date with your changes.
          </Trans>
        </ReasonToSubscribe>
        <ReasonToSubscribe
          alt="More Themes"
          heading={<Trans>More Themes</Trans>}
          imgSrc="/images/n.png"
        >
          <Trans>Get access to alternative styles for your flowcharts</Trans>
        </ReasonToSubscribe>
        <ReasonToSubscribe
          alt="More Layouts"
          heading={<Trans>More Layouts</Trans>}
          imgSrc="/images/l.png"
        >
          <Trans>
            Powerful layout algorithms that bring order to graphs of all shapes
            and sizes
          </Trans>
        </ReasonToSubscribe>
      </Box>
      <Box gap={4}>
        <LoginBlock />
        <SponsorBlock />
      </Box>
    </Box>
  );
}

type SignUpFormData = {
  email: string;
  subscription: "monthly" | "yearly";
};

function SignUpForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { register, handleSubmit, control } = useForm<SignUpFormData>({
    defaultValues: { subscription: "monthly", email: "" },
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

      if (createPaymentError) throw createPaymentError;
      if (!paymentMethod) throw new Error("No Payment Method");

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
      gap={7}
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
            <Box flow="column" gap={2}>
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
          typeProps={{ size: 1 }}
        />
        <Box template="auto / auto auto" content="normal space-between">
          <Type size={-1} as="span">
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

function ReasonToSubscribe({
  heading,
  children,
  imgSrc,
  objectFit = "cover",
  alt,
}: {
  heading: ReactNode;
  children: ReactNode;
  imgSrc: string;
  objectFit?: string;
  alt: string;
}) {
  return (
    <Box flow="column" gap={7} content="start" items="center">
      <Box
        as="img"
        rad={3}
        src={imgSrc}
        alt={alt}
        className={styles.ReasonToSubscribeImg}
        style={{ objectFit }}
      />
      <Box gap={2}>
        <Type size={3} weight="400" as="h2">
          {heading}
        </Type>
        <Type size={0}>{children}</Type>
      </Box>
    </Box>
  );
}

function SponsorBlock() {
  return (
    <Section
      content="start normal"
      className={styles.SponsorBlock}
      p={8}
      rad={2}
      gap={8}
    >
      <SectionTitle
        color="palette-purple-0"
        weight="700"
        className={styles.SponsorBlockTitle}
      >
        <Trans>Become a Sponsor</Trans>
      </SectionTitle>
      <SignUpForm />
    </Section>
  );
}

function LoginBlock() {
  return (
    <Box p={8} pt={7} background="palette-white-2" rad={3}>
      <LoginForm
        heading={
          <Type style={{ textAlign: "center" }} color="palette-black-0">
            <Trans>Already a sponsor? Log in here</Trans>
          </Type>
        }
      />
    </Box>
  );
}
