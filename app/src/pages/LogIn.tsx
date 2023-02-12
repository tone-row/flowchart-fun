import { t, Trans } from "@lingui/macro";
import { CircleNotch } from "phosphor-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { Link } from "react-router-dom";

import { Warning } from "../components/Warning";
import { isError } from "../lib/helpers";
import { login } from "../lib/queries";

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

  return (
    <div className="pt-4 grid justify-items-center">
      <div className="w-96 grid gap-4 content-start pt-4">
        <div className="text-3xl font-bold text-center">Log In</div>
        {success ? (
          <div className="text text-xl text-neutral-700 text-center">
            <Trans>
              Check your email for a link to log in. You can close this window.
            </Trans>
          </div>
        ) : (
          <form
            className="p-6 pt-5 rounded-md gap-3 grid"
            onSubmit={handleSubmit(onSubmit)}
          >
            <label className="text text-neutral-700 grid">
              <span className="text-sm text-neutral-500">Email</span>
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
            <button className="bg-neutral-200 rounded-lg text-xl text-center font-bold px-16 py-4 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-neutral-200 dark:disabled:hover:bg-neutral-800 focus:outline-none focus:shadow-none active:bg-neutral-400 dark:active:bg-neutral-700 focus:bg-neutral-300 dark:focus:bg-neutral-700">
              {isLoading ? (
                <CircleNotch size={24} className="animate-spin inline-block" />
              ) : (
                <Trans>Submit</Trans>
              )}
            </button>
            {isError(error) && <Warning>{error.message}</Warning>}
            <span className="text-center text-sm">
              {t`Don't have an account?`}
              <Link
                to="/pricing"
                className="text-blue-500 hover:underline focus:underline ml-1"
              >
                <Trans>Sign Up</Trans>
              </Link>
            </span>
          </form>
        )}
      </div>
    </div>
  );
}
