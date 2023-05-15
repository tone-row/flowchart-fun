import { t, Trans } from "@lingui/macro";
import { CircleNotch, HandWaving } from "phosphor-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { Link } from "react-router-dom";

import { Warning } from "../components/Warning";
import { WelcomeMessage } from "../components/WelcomeMessage";
import { isError } from "../lib/helpers";
import { login } from "../lib/queries";
import { BlueButton } from "../ui/BlueButton";
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
      <div className="pt-12 grid justify-items-center content-start gap-4 w-full max-w-[370px] mx-auto">
        <EmailPassword width={180} height={180} />
        <p className="text text-lg leading-tight">
          <Trans>
            Check your email for a link to log in. You can close this window.
          </Trans>
        </p>
        <div className="flex gap-2 items-start text-neutral-700 mt-2">
          <HandWaving size={24} className="w-[24px] min-w-[24px]" />
          <p className="text-xs text-neutral-700">
            {t`Once in a while the magic link will end up in your spam folder. If you
        don't see it after a few minutes, check there or request a new link.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12 grid justify-items-center content-start gap-12">
      {newSignUp && <WelcomeMessage />}
      <div className="w-[370px] grid gap-2 content-start pt-4">
        <PageTitle>Log In</PageTitle>
        <form className="gap-2 grid" onSubmit={handleSubmit(onSubmit)}>
          <p className="text text-lg text-neutral-700 leading-tight">
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
          <BlueButton disabled={isLoading} className="w-full justify-center">
            {isLoading ? (
              <CircleNotch size={18} className="animate-spin inline-block" />
            ) : (
              <Trans>Submit</Trans>
            )}
          </BlueButton>
          {isError(error) && <Warning>{error.message}</Warning>}
          <span className="text-xs mt-3">
            {t`Don't have an account?`}
            <Link
              to="/pricing"
              className="text-blue-500 hover:underline focus:underline ml-1"
            >
              <Trans>Sign Up</Trans>
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
}
