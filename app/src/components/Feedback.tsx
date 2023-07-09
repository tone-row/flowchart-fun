import { t, Trans } from "@lingui/macro";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { Link } from "react-router-dom";

import { mail } from "../lib/queries";
import { useLastChart } from "../lib/useLastChart";
import { Button2, Input, Notice, Page2, Textarea } from "../ui/Shared";
import { Label, PageTitle, SectionTitle } from "../ui/Typography";
import Spinner from "./Spinner";

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
    <Page2 data-testid="feedback">
      <header className="grid gap-4">
        <PageTitle className="text-center">
          <Trans>Send us Feedback</Trans>
        </PageTitle>
        <p className="text-center text-neutral-500 dark:text-neutral-400">
          <Trans>
            Found a bug? Have a feature request? We would love to hear from you!
          </Trans>
        </p>
      </header>
      {success ? (
        <Success />
      ) : (
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
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
          <Button2 disabled={!isValid} color="blue">
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
    </Page2>
  );
}

function Success() {
  const lastChart = useLastChart((s) => s.lastChart);
  return (
    <div className="grid gap-4 bg-green-100 p-4 rounded-lg text-center">
      <SectionTitle className="text-green-700">
        <Trans>Thank you for your feedback!</Trans>
      </SectionTitle>
      <Link to={lastChart} className="underline text-sm">
        <Trans>Back To Editor</Trans>
      </Link>
    </div>
  );
}
