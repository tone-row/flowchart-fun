import { Trans, t } from "@lingui/macro";
import { useCallback, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Box, Type } from "../slang";
import styles from "./Feedback.module.css";
import Spinner from "./Spinner";
import { Input, Section, SectionTitle, Textarea, Button } from "./Shared";
import { AppContext } from "./AppContext";

const noPaddingBottom = { tablet: { pb: 0 } };
const largeGap = 10;

type FormData = { from?: string; text: string };

const msg = {
  to: process.env.REACT_APP_FEEDBACK_TO,
  subject: "Flowchart Fun Feedback",
};

const defaultError = t`An error occurred. Try resubmitting or email ${process.env.REACT_APP_FEEDBACK_TO} directly.`;

export default function Feedback() {
  const { register, handleSubmit, reset, watch } = useForm<FormData>();
  const textMessage = watch("text");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
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
            <Box gap={2}>
              <SectionTitle>
                <Trans>What would you like to share with us?</Trans>
              </SectionTitle>
              <Type as="p" size={-1}>
                <Trans>
                  We appreciate all of your feedback, suggestions, bugs, and
                  feature requests!
                </Trans>
              </Type>
            </Box>
            <Textarea rows={4} {...register("text", { required: true })} />
          </Section>
          <Section>
            <SectionTitle>
              <Trans>Email (optional)</Trans>
            </SectionTitle>
            <Input type="email" {...register("from")} />
          </Section>
          <Button
            type="submit"
            style={{ justifySelf: "start" }}
            disabled={!(textMessage && textMessage.length)}
          >
            <Trans>Submit</Trans>
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

function Success() {
  const { setShowing } = useContext(AppContext);
  return (
    <Section self="center">
      <Type size={3} color="palette-green-0">
        <Trans>Thank you for your feedback!</Trans>
      </Type>
      <Button onClick={() => setShowing("editor")}>
        <Trans>Back To Editor</Trans>
      </Button>
    </Section>
  );
}

function isError(x: unknown): x is Error {
  return (x as Error).message !== undefined;
}
