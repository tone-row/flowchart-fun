import { t, Trans } from "@lingui/macro";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { Link } from "react-router-dom";

import { mail } from "../lib/queries";
import { useLastChart } from "../lib/useLastChart";
import { Button, Input, Notice, Textarea } from "../ui/Shared";
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
    <div
      className="grid gap-12 w-full max-w-[700px] mx-auto pt-16 px-4 content-start"
      data-testid="feedback"
    >
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
          <Button
            type="submit"
            style={{ justifySelf: "center" }}
            disabled={!isValid}
            text={t`Submit`}
          />
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
