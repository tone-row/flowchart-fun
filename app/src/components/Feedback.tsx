import { t, Trans } from "@lingui/macro";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { Link } from "react-router-dom";

import { mail } from "../lib/queries";
import { useLastChart } from "../lib/useLastChart";
import { Type } from "../slang";
import styles from "./Feedback.module.css";
import {
  Button,
  Input,
  Notice,
  Page,
  Section,
  SectionTitle,
  Textarea,
} from "./Shared";
import Spinner from "./Spinner";

const noPaddingBottom = { tablet: { pb: 0 } };

type FormData = { from: string; text: string };

const msg = {
  to: process.env.REACT_APP_FEEDBACK_TO as string,
  subject: "Flowchart Fun Feedback",
};

export default function Feedback() {
  const { register, handleSubmit, reset, watch } = useForm<FormData>();
  const fields = watch();
  const isValid = fields.from && fields.text;
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
    (data: FormData) => send({ ...msg, ...data }),
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
      data-testid="feedback"
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
          <SectionTitle>
            <Trans>Feedback</Trans>
          </SectionTitle>
          <Type>
            <Trans>
              We appreciate all of your feedback, suggestions, bugs, and feature
              requests!
            </Trans>
          </Type>
          <Section>
            <Type>
              <Trans>What would you like to share with us?</Trans>
            </Type>
            <Textarea
              rows={4}
              {...register("text", { required: true })}
              data-testid="message"
            />
          </Section>
          <Section>
            <Type>
              <Trans>Email</Trans>
            </Type>
            <Input
              type="email"
              {...register("from", { required: true })}
              data-testid="email"
            />
          </Section>
          <Button
            type="submit"
            style={{ justifySelf: "start" }}
            disabled={!isValid}
            text={t`Submit`}
          />
          {error instanceof Error && (
            <Notice>
              {t`An error occurred. Try resubmitting or email ${process.env.REACT_APP_FEEDBACK_TO} directly.`}
            </Notice>
          )}
        </Page>
      )}
      {isLoading && <Spinner className={styles.FeedbackLoading} />}
    </Page>
  );
}

function Success() {
  const lastChart = useLastChart((s) => s.lastChart);
  return (
    <Section self="center">
      <Type size={2}>
        <Trans>Thank you for your feedback!</Trans>
      </Type>
      <Type color="color-highlightColor">
        <Link to={lastChart}>
          <Trans>Back To Editor</Trans>
        </Link>
      </Type>
    </Section>
  );
}
