import { useCallback, useState } from "react";
import { Box, Type } from "../slang";
import { Button, Input, Notice, Section, SectionTitle } from "./Shared";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { login } from "../lib/queries";
import { isError } from "../lib/helpers";
import { t, Trans } from "@lingui/macro";

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
      <SectionTitle>
        <Trans>Log In</Trans>
      </SectionTitle>
      {success ? (
        <Box background="color-nodeHover" p={2} rad={2}>
          <Type>
            <Trans>
              Check your email for a link to log in. You can close this window.
            </Trans>
          </Type>
        </Box>
      ) : (
        <Box gap={2}>
          <Box template="auto / minmax(0, 1fr) auto" gap={2}>
            <Input
              type="email"
              {...register("email", {
                required: true,
                setValueAs: (t) => t.toLowerCase(),
              })}
              disabled={isLoading}
              placeholder={t`Email`}
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
