import { t, Trans } from "@lingui/macro";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { Link } from "react-router-dom";

import { Warning } from "../components/Warning";
import { WelcomeMessage } from "../components/WelcomeMessage";
import { isError } from "../lib/helpers";
import { login } from "../lib/queries";
import { Button2, Page } from "../ui/Shared";
import { Label, PageTitle } from "../ui/Typography";
import { ReactComponent as EmailPassword } from "./EmailPassword.svg";

type Fields = {
  email: string;
};

export default function Login() {
  const { register, handleSubmit } = useForm<Fields>();
  const [success, setSuccess] = useState(false);
  const { mutate, isLoading, error } = useMutation(login, {
    onSuccess: () => setSuccess(true),
  });

  const onSubmit = useCallback(
    ({ email }: Fields) => {
      mutate(email);
    },
    [mutate]
  );

  const [newSignUp] = useState(() => {
    return window.location.hash === "#success";
  });

  if (success) {
    return (
      <div className="pt-12 grid justify-items-center content-start gap-4 w-full max-w-[440px] mx-auto text-center">
        <EmailPassword
          width={180}
          height={180}
          className="stroke-foreground dark:stroke-background"
        />
        <p className="text text-lg leading-tight ml-4 text-wrap-balance">
          <Trans>
            Check your email for a link to log in.
            <br />
            You can close this window.
          </Trans>
        </p>
        <div className="text-neutral-600 ml-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-6">
            <Trans>
              Once in a while the magic link will end up in your spam folder. If
              you don&apos;t see it after a few minutes, check there or request
              a new link.
            </Trans>
          </p>
        </div>
      </div>
    );
  }

  return (
    <Page>
      {newSignUp && <WelcomeMessage />}
      <div className="grid gap-3 content-start">
        <PageTitle className="text-center">{t`Log In`}</PageTitle>
        <form className="gap-2 grid" onSubmit={handleSubmit(onSubmit)}>
          <p className="text-center text-neutral-500 leading-normal dark:text-neutral-400">
            <Trans>
              We use magic links to log you in. Enter your email below to get
              started.
            </Trans>
          </p>
          <label className="grid mt-4">
            <Label size="xs">Email</Label>
            <input
              className="p-4 mt-1 border bg-background dark:bg-[#0f0f0f] border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring focus:ring-neutral-400 focus:ring-opacity-25 focus:ring-offset-1 dark:text-neutral-50"
              autoComplete="off"
              {...register("email", {
                required: true,
                setValueAs: (t) => t.toLowerCase(),
              })}
              disabled={isLoading}
            />
          </label>
          <Button2
            disabled={isLoading}
            className="w-full justify-center"
            isLoading={isLoading}
            color="blue"
          >
            <Trans>Submit</Trans>
          </Button2>
          {isError(error) && <Warning>{error.message}</Warning>}
          <span className="text-sm mt-5">
            {t`Don't have an account?`}
            <Link
              to="/pricing"
              className="text-blue-500 hover:underline focus:underline ml-1"
            >
              <Trans>Sign Up Now</Trans>
            </Link>
          </span>
        </form>
      </div>
    </Page>
  );
}
