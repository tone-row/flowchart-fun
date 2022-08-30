import { t, Trans } from "@lingui/macro";
import { ReactNode, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";

import { isError } from "../lib/helpers";
import { login } from "../lib/queries";
import { Box, Type } from "../slang";
import styles from "./LoginForm.module.css";
import { Button, Input, Notice, Section } from "./Shared";
type Fields = {
  email: string;
};
export function LoginForm({ heading }: { heading: ReactNode }) {
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
    <Section as="form" onSubmit={handleSubmit(onSubmit)}>
      {heading}
      {success ? (
        <Box
          background="color-nodeHover"
          p={2}
          rad={2}
          style={{ textAlign: "center" }}
        >
          <Type size={-1}>
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
              size={0}
              className={styles.LoginFormInput}
            />
            <Button
              className={styles.SignInButton}
              type="submit"
              text={t`Sign In`}
            />
          </Box>
          {isError(error) && (
            <Box flow="column" items="start space-between">
              <Notice>
                <Type size={-1}>{(error as { message: string }).message}</Type>
              </Notice>
            </Box>
          )}
        </Box>
      )}
    </Section>
  );
}
