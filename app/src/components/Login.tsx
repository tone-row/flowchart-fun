import { useCallback, useContext, useState } from "react";
import { Box, Type } from "../slang";
import { Button, Input, Notice, Section, SectionTitle } from "./Shared";
import { useForm } from "react-hook-form";
import { AppContext } from "./AppContext";
import { SponsorDashboard } from "./SponsorDashboard";
import { useMutation } from "react-query";
import { login } from "../lib/queries";
import { isError } from "../lib/helpers";
import { t } from "@lingui/macro";

export default function Login() {
  const { session } = useContext(AppContext);
  return !session ? <LoginForm /> : <SponsorDashboard />;
}

export function LoginForm() {
  const { register, handleSubmit } = useForm();
  const [success, setSuccess] = useState(false);
  const { mutate, isLoading, error } = useMutation(login, {
    onSuccess: () => setSuccess(true),
  });
  const onSubmit = useCallback(
    ({ email }: { email: string }) => {
      mutate(email);
    },
    [mutate]
  );
  return (
    <Section as="form" onSubmit={handleSubmit(onSubmit)}>
      <SectionTitle>Log In</SectionTitle>
      {success ? (
        <Box background="color-nodeHover" p={2} rad={2}>
          <Type>Check your email for the login link!</Type>
        </Box>
      ) : (
        <Box gap={2}>
          <Box template="auto / minmax(0, 1fr) auto" gap={2}>
            <Input
              {...register("email", { required: true })}
              disabled={isLoading}
              placeholder="Email"
              isLoading={isLoading}
            />
            <Button type="submit" text={t`Submit`} />
          </Box>
          <Box flow="column" items="start space-between">
            {isError(error) && (
              <Notice>
                <Type size={-1}>{(error as { message: string }).message}</Type>
              </Notice>
            )}
          </Box>
        </Box>
      )}
    </Section>
  );
}
