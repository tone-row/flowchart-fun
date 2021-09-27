import { Trans, t } from "@lingui/macro";
import { ReactNode, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Box, BoxProps, Type } from "../slang";
import { Button } from "./Button";
import { Input, Textarea } from "./Input";
import styles from "./Feedback.module.css";
import Spinner from "./Spinner";
import { useFeature } from "flagged";

const noPaddingBottom = { tablet: { pb: 0 } };
const largeGap = 10;

type FormData = { from?: string; text: string };

const msg = {
  to: process.env.REACT_APP_FEEDBACK_TO,
  subject: "Flowchart Fun Feedback",
};

const defaultError = t`An error occurred. Try resubmitting or email ${process.env.REACT_APP_FEEDBACK_TO} directly.`;

export default function Feedback() {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const isNext = useFeature("next");
  const onSubmit = useCallback(
    (data: FormData) => {
      (async function () {
        try {
          setError("");
          setSubmitting(true);
          const email = { ...msg, ...data };
          if (!email.from) email.from = "Unknown Sender <info@tone-row.com>";
          const response = await fetch("/api/mail", {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            body: JSON.stringify({ email }),
            headers: { "Content-Type": "application/json" },
          });
          if (!response) throw new Error(defaultError);
          const body = await response.json();
          if (!body?.success) throw new Error(defaultError);
          reset();
          setSuccess(true);
        } catch (err) {
          if (isError(err)) setError(err.message);
        } finally {
          setSubmitting(false);
        }
      })();
    },
    [reset]
  );
  return (
    <Box
      px={4}
      py={2}
      at={noPaddingBottom}
      gap={largeGap}
      content="start normal"
      className={styles.FeedbackWrapper}
      self="stretch center"
    >
      {success ? (
        <Success />
      ) : (
        <Box
          gap={largeGap}
          as="form"
          pb={4}
          onSubmit={handleSubmit(onSubmit)}
          className={[
            styles.FeedbackForm,
            submitting ? styles.Submitting : "",
          ].join(" ")}
        >
          <Section>
            {!isNext && (
              <Type weight="700">
                <Trans>Feedback</Trans>
              </Type>
            )}
            <Type as="p">
              <Trans>
                We appreciate all of your feedback, suggestions, bugs, and
                feature requests!
              </Trans>
            </Type>
          </Section>
          <Section>
            <Type size={-1} weight="700">
              <Trans>What would you like to share with us?</Trans>
            </Type>
            <Textarea rows={4} {...register("text", { required: true })} />
          </Section>
          <Section>
            <Type size={-1} weight="700">
              <Trans>Email (optional)</Trans>
            </Type>
            <Input type="email" {...register("from")} />
          </Section>
          <Button type="submit" style={{ justifySelf: "start" }}>
            Submit
          </Button>
          {error && (
            <Box background="palette-orange-1" p={2} color="palette-black-0">
              <Type>{error}</Type>
            </Box>
          )}
        </Box>
      )}
      {submitting && <Spinner className={styles.FeedbackLoading} />}
    </Box>
  );
}

function Section({
  as = "div",
  children,
  ...props
}: { children: ReactNode } & BoxProps) {
  return (
    <Box gap={2} as={as} {...props}>
      {children}
    </Box>
  );
}

function Success() {
  return (
    <Type weight="700">
      <Trans>Thank you for your feedback!</Trans>
    </Type>
  );
}

function isError(pet: unknown): pet is Error {
  return (pet as Error).message !== undefined;
}
