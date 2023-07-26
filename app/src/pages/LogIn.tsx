import { t, Trans } from "@lingui/macro";
import { Envelope, GithubLogo, GoogleLogo } from "phosphor-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";

import { Warning } from "../components/Warning";
import { WelcomeMessage } from "../components/WelcomeMessage";
import { isError } from "../lib/helpers";
import { supabase } from "../lib/supabaseClient";
import { Button2, Page } from "../ui/Shared";
import { Label, PageTitle } from "../ui/Typography";
import { ReactComponent as EmailPassword } from "./EmailPassword.svg";
import { Link } from "react-router-dom";
import { AuthOtpResponse } from "@supabase/supabase-js";
import { useLocation } from "react-router-dom";
type Fields = {
  email: string;
};

export default function Login() {
  // check for auth wall warning
  const { search } = useLocation();
  const [showAuthWallWarning, redirectUrl] =
    checkForAuthWallWarningAndRedirect(search);

  // check and see if there is
  const { register, handleSubmit } = useForm<Fields>();
  const [success, setSuccess] = useState(false);
  const { mutate, isLoading, error } = useMutation<
    AuthOtpResponse,
    Record<string, never>,
    { email: string }
  >(
    async ({ email }) => {
      if (!supabase) throw new Error("No supabase client");
      return supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
    },
    {
      onSuccess: () => setSuccess(true),
    }
  );

  const onSubmit = useCallback(
    ({ email }: Fields) => {
      mutate({ email });
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
    <Page size="sm">
      {showAuthWallWarning && <AuthWallWarning />}
      {newSignUp && <WelcomeMessage />}
      <PageTitle className="text-center mb-6">{t`Sign In`}</PageTitle>
      <Button2
        leftIcon={<GoogleLogo size={24} />}
        onClick={() => {
          supabase?.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: redirectUrl,
            },
          });
        }}
      >
        Sign in with Google
      </Button2>
      <Button2
        leftIcon={<GithubLogo size={24} />}
        onClick={() => {
          supabase?.auth.signInWithOAuth({
            provider: "github",
            options: {
              redirectTo: redirectUrl,
            },
          });
        }}
      >
        Sign in with GitHub
      </Button2>
      <div className="relative my-12">
        <hr />
        <p className="text-center text-neutral-500 leading-normal dark:text-neutral-400 bg-background dark:bg-[#0f0f0f] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 -mt-px">
          <Trans>or</Trans>
        </p>
      </div>
      <p className="text-center text-neutral-500 leading-normal dark:text-neutral-400 mb-3">
        <Trans>
          Enter your email address and we&apos;ll send you a magic link to sign
          in.
        </Trans>
      </p>
      <form className="gap-2 grid" onSubmit={handleSubmit(onSubmit)}>
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
          leftIcon={<Envelope size={24} />}
        >
          <Trans>Request Magic Link</Trans>
        </Button2>
        {isError(error) && <Warning>{error.message}</Warning>}
      </form>
    </Page>
  );
}

function AuthWallWarning() {
  return (
    <div className="bg-yellow-100 text-yellow-900 p-4 text-center text-md grid gap-2 mb-6 leading-normal rounded-lg">
      <p className="font-bold">
        <Trans>You need to log in to access this page.</Trans>
      </p>
      <p className="text-wrap-balance">
        <Trans>
          To learn more about why we require you to log in, please read{" "}
          <Link to="/blog/post/important-changes-coming" className="underline">
            this blog post
          </Link>
          .
        </Trans>
      </p>
    </div>
  );
}

function checkForAuthWallWarningAndRedirect(search: string): [boolean, string] {
  const params = new URLSearchParams(search);
  const showAuthWallWarning = params.get("showAuthWallWarning") === "true";
  const redirectUrl = decodeURIComponent(params.get("redirectUrl") || "/"); // default to home page
  return [showAuthWallWarning, redirectUrl];
}
