import { Trans, t } from "@lingui/macro";
import { useCallback, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Box, Type } from "../slang";
import styles from "./Feedback.module.css";
import Spinner from "./Spinner";
import { Input, Section, SectionTitle, Textarea, Button, Page } from "./Shared";
import { AppContext } from "./AppContext";
import { useMutation } from "react-query";
import { mail } from "../lib/queries";

const noPaddingBottom = { tablet: { pb: 0 } };

type FormData = { from: string; text: string };

const msg = {
  to: process.env.REACT_APP_FEEDBACK_TO as string,
  subject: "Flowchart Fun Feedback",
};

export default function Feedback() {
  const { register, handleSubmit, reset, watch } = useForm<FormData>();
  const message = watch("text");
  const [success, setSuccess] = useState(false);
  const {
    error,
    isLoading,
    mutate: send,
  } = useMutation({
    mutationFn: mail,
    onSuccess: () => {
      setSuccess(true);
      reset();
    },
  });
  const onSubmit = useCallback(
    (data: FormData) => {
      const email = { ...msg, ...data };
      if (!email.from) email.from = "Unknown Sender <info@tone-row.com>";
      send(email);
    },
    [send]
  );
  return (
    <Page
      px={4}
      py={8}
      at={noPaddingBottom}
      content="start normal"
      className={styles.FeedbackWrapper}
      self="stretch center"
    >
      {success ? (
        <Success />
      ) : (
        <Page
          as="form"
          pb={4}
          onSubmit={handleSubmit(onSubmit)}
          className={[
            styles.FeedbackForm,
            isLoading ? styles.Submitting : "",
          ].join(" ")}
        >
          <Type>
            <Trans>
              We appreciate all of your feedback, suggestions, bugs, and feature
              requests!
            </Trans>
          </Type>
          <Section>
            <SectionTitle>
              <Trans>What would you like to share with us?</Trans>
            </SectionTitle>
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
            disabled={!(message && message.length)}
            text={t`Submit`}
          />
          {error instanceof Error && (
            <Box
              background="palette-orange-1"
              p={2}
              color="palette-black-0"
              rad={1}
            >
              <Type
                size={-1}
              >{t`An error occurred. Try resubmitting or email ${process.env.REACT_APP_FEEDBACK_TO} directly.`}</Type>
            </Box>
          )}
        </Page>
      )}
      {isLoading && <Spinner className={styles.FeedbackLoading} />}
    </Page>
  );
}

function Success() {
  const { setShowing } = useContext(AppContext);
  return (
    <Section self="center">
      <Type size={2}>
        <Trans>Thank you for your feedback!</Trans>
      </Type>
      <Button onClick={() => setShowing("editor")} text={t`Back To Editor`} />
    </Section>
  );
}
