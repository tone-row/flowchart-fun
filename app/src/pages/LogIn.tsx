import { t, Trans } from "@lingui/macro";
import { Envelope, GithubLogo, GoogleLogo, Lock } from "phosphor-react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";

import { Warning } from "../components/Warning";
import { WelcomeMessage } from "../components/WelcomeMessage";
import { isError } from "../lib/helpers";
import { supabase } from "../lib/supabaseClient";
import { Button2, InputWithLabel, P, Page } from "../ui/Shared";
import { PageTitle } from "../ui/Typography";
import { ReactComponent as EmailPassword } from "./EmailPassword.svg";
import { Link, useNavigate } from "react-router-dom";
import { AuthOtpResponse } from "@supabase/supabase-js";
import { useLocation } from "react-router-dom";
import { useIsLoggedIn } from "../lib/hooks";
import { AppContext } from "../components/AppContext";

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

  // Watch log in state and redirect if it changes
  const navigate = useNavigate();
  const { checkedSession } = useContext(AppContext);
  const isLoggedIn = useIsLoggedIn();
  useEffect(() => {
    if (!checkedSession) return;
    if (checkedSession && isLoggedIn) {
      // go to account page
      window.location.href = redirectUrl;
    }
  }, [checkedSession, isLoggedIn, navigate, redirectUrl]);

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
        <P>
          <Trans>
            Check your email for a link to log in.
            <br />
            You can close this window.
          </Trans>
        </P>
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
      <Or />
      <p className="text-center text-neutral-500 leading-normal dark:text-neutral-400 mb-3">
        <Trans>
          Enter your email address and we&apos;ll send you a magic link to sign
          in.
        </Trans>
      </p>
      <form className="gap-2 grid" onSubmit={handleSubmit(onSubmit)}>
        <InputWithLabel
          label={t`Email`}
          inputProps={{
            autoComplete: "off",
            disabled: isLoading,
            ...register("email", {
              required: true,
              setValueAs: (t) => t.toLowerCase(),
            }),
          }}
        />
        <Button2
          disabled={isLoading}
          className="w-full justify-center"
          isLoading={isLoading}
          leftIcon={<Envelope size={24} />}
          data-testid="request-magic-link"
        >
          <Trans>Request Magic Link</Trans>
        </Button2>
        {isError(error) && <Warning>{error.message}</Warning>}
      </form>
      <Or />
      <UserPass redirectUrl={redirectUrl} />
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

function Or() {
  return (
    <div className="relative my-8">
      <hr />
      <p className="text-center text-neutral-500 leading-normal dark:text-neutral-400 bg-background dark:bg-[#0f0f0f] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 -mt-px">
        <Trans>or</Trans>
      </p>
    </div>
  );
}

function UserPass({ redirectUrl }: { redirectUrl: string }) {
  const [method, setMethod] = useState<"Sign In" | "Sign Up">("Sign In");
  const formRef = useRef<HTMLFormElement>(null);
  const signInMutation = useMutation<
    string,
    Record<string, never>,
    { email: string; password: string }
  >(
    async ({ email, password }) => {
      if (!supabase) throw new Error("No supabase client");

      if (method === "Sign Up") {
        // try sign up
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        console.log(data);
        if (error) throw error;
        return t`Confirm your email address to sign in.`;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Returns empty string if login was successful for existing user
        return "";
      }
    },
    {
      onSuccess: (result) => {
        // reset form
        formRef.current?.reset();

        // if no message, redirect (Although this will be caught by root component and redirect first)
        if (!result) {
          window.location.href = redirectUrl;
        }
      },
    }
  );
  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const formdata = new FormData(e.target as HTMLFormElement);
      const email = formdata.get("email") as string;
      const password = formdata.get("password") as string;

      if (!email || !password || !supabase) return;

      signInMutation.mutate({ email, password });
    },
    [signInMutation]
  );
  return (
    <>
      <P>
        <span className="text-[12px] font-mono inline-block mr-2 -translate-y-px text-blue-500">
          <Trans>Choose</Trans>:{" "}
        </span>
        <button
          className="p-[2px] border-b border-neutral-400 border-solid border-0 opacity-30 data-[active=true]:opacity-100"
          data-active={method === "Sign In"}
          onClick={() => setMethod("Sign In")}
        >
          Sign In
        </button>{" "}
        /{" "}
        <button
          data-active={method === "Sign Up"}
          className="p-[2px] border-b border-neutral-400 border-solid border-0 opacity-30 data-[active=true]:opacity-100"
          onClick={() => setMethod("Sign Up")}
        >
          Sign Up
        </button>{" "}
        with email and password
      </P>
      <form className="gap-2 grid" onSubmit={handleSubmit} ref={formRef}>
        <InputWithLabel
          label={t`Email`}
          inputProps={{
            autoComplete: "email",
            name: "email",
            required: true,
            type: "email",
            disabled: signInMutation.isLoading,
          }}
        />
        <InputWithLabel
          label={t`Password`}
          inputProps={{
            autoComplete: "current-password",
            name: "password",
            required: true,
            type: "password",
            pattern: ".{6,}",
            disabled: signInMutation.isLoading,
          }}
        />
        <Button2
          type="submit"
          className="w-full justify-center"
          isLoading={signInMutation.isLoading}
          leftIcon={<Lock size={24} />}
          data-testid="sign-in-email-pass"
        >
          <Trans>Sign In</Trans>
        </Button2>
        {signInMutation.isError && (
          <Warning>{signInMutation.error.message}</Warning>
        )}
        {signInMutation.data && <Warning>{signInMutation.data}</Warning>}
      </form>
      <p className="text-center text-neutral-500 leading-normal dark:text-neutral-400 mb-3 text-xs">
        <Link to="/forgot-password">
          <Trans>Forgot your password?</Trans>
        </Link>
      </p>
    </>
  );
}
