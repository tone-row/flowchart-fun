import { t, Trans } from "@lingui/macro";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { Link } from "react-router-dom";

import { mail } from "../lib/queries";
import { useLastChart } from "../lib/useLastChart";
import { Button2, Input, Notice, Page, Textarea } from "../ui/Shared";
import { Label, PageTitle } from "../ui/Typography";
import Spinner from "./Spinner";

type FormData = { from: string; text: string };

const msg = {
  to: process.env.REACT_APP_FEEDBACK_TO as string,
  subject: "Flowchart Fun Feedback",
};

export default function Feedback() {
  const { register, handleSubmit, reset, watch } = useForm<FormData>({
    defaultValues: {
      from: "",
      text: new URLSearchParams(window.location.search).get("text") || "",
    },
  });
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
      data-testid="feedback"
      size="sm"
      className="gap-8 !py-8 md:!py-12 !content-start"
    >
      <PageTitle className="text-center">
        <Trans>Feedback</Trans>
      </PageTitle>
      <div className="bg-white rounded-lg border border-neutral-200/60 dark:bg-neutral-900 dark:border-neutral-800 p-8 md:p-10 max-w-md mx-auto w-full">
        <p className="text-center text-neutral-500 dark:text-neutral-400 text-sm mb-6 leading-normal">
          <Trans>
            Tell us what&apos;s working and what isn&apos;t. Every message is
            read by the developer.
          </Trans>
        </p>
        {success ? (
          <Success />
        ) : (
          <form
            data-testid="feedback-form"
            className="grid gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <section className="grid gap-2">
              <Label>
                <Trans>Email</Trans>
              </Label>
              <Input
                type="email"
                {...register("from", { required: true })}
                data-testid="email"
              />
            </section>
            <section className="grid gap-2">
              <Label>
                <Trans>Comment</Trans>
              </Label>
              <Textarea
                rows={4}
                {...register("text", { required: true })}
                data-testid="message"
              />
            </section>
            <Button2 disabled={!isValid} color="blue" size="md">
              <Trans>Submit</Trans>
            </Button2>
            {error instanceof Error && (
              <div className="justify-self-center">
                <Notice>
                  {t`An error occurred. Try resubmitting or email ${process.env.REACT_APP_FEEDBACK_TO} directly.`}
                </Notice>
              </div>
            )}
          </form>
        )}
        {isLoading && (
          <div className="justify-self-center">
            <Spinner className="text-blue-400 dark:text-blue-500" />
          </div>
        )}
      </div>
    </Page>
  );
}

function Success() {
  const lastChart = useLastChart((s) => s.lastChart);
  return (
    <div className="grid gap-4 text-center">
      <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
        <Trans>Thank you for your feedback!</Trans>
      </h2>
      <Link
        to={lastChart}
        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
      >
        <Trans>Back To Editor</Trans>
      </Link>
    </div>
  );
}
