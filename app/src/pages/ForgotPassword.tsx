import { Trans, t } from "@lingui/macro";
import { Button2, InputWithLabel, P, Page } from "../ui/Shared";
import { PageTitle } from "../ui/Typography";
import { useMutation } from "react-query";
import { supabase } from "../lib/supabaseClient";
import { Warning } from "../components/Warning";
import { AuthError } from "@supabase/supabase-js";
import { useRef } from "react";

export default function ForgotPassword() {
  const formRef = useRef<HTMLFormElement>(null);
  const resetPasswordMutation = useMutation<
    true | null,
    AuthError | null,
    { email: string }
  >(
    async ({ email }) => {
      if (!supabase) return null;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return true;
    },
    {
      onSettled: () => {
        formRef.current?.reset();
      },
    }
  );
  return (
    <Page size="sm">
      <PageTitle className="text-center mb-2">
        <Trans>Reset Password</Trans>
      </PageTitle>
      <P className="text-wrap-balance">
        <Trans>
          Enter your email address below and we'll send you a link to reset your
          password.
        </Trans>
      </P>
      <form
        className="grid gap-2"
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const email = formData.get("email") as string;
          resetPasswordMutation.mutate({ email });
        }}
      >
        <InputWithLabel
          label={t`Email`}
          inputProps={{
            type: "email",
            name: "email",
            placeholder: t`Email`,
            required: true,
          }}
        />
        <Button2 type="submit">
          <Trans>Request Password Reset</Trans>
        </Button2>
      </form>
      {resetPasswordMutation.error && (
        <Warning>{resetPasswordMutation.error.message}</Warning>
      )}
      {resetPasswordMutation.data && (
        <Warning>
          <Trans>
            If an account with that email exists, we've sent you an email with
            instructions on how to reset your password.
          </Trans>
        </Warning>
      )}
    </Page>
  );
}
