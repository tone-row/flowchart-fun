import { useCallback, useContext, useState } from "react";
import { Box, Type } from "../slang";
import { Button, Input, Page, Section, SectionTitle } from "./Shared";
import styles from "./Login.module.css";
import { useForm } from "react-hook-form";
import { supabase } from "../supabaseClient";
import { isError } from "./isError";
import Spinner from "./Spinner";
import { AppContext } from "./AppContext";

export default function Login() {
  const { session } = useContext(AppContext);
  return !session ? <LoginForm /> : <Authed />;
}

function Authed() {
  const { session } = useContext(AppContext);
  const signOut = useCallback(() => {
    (async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    })();
  }, []);

  return (
    <Box
      className={styles.Wrapper}
      self="normal center"
      content="start normal"
      pt={8}
    >
      <Page>
        <Section>
          <SectionTitle>User</SectionTitle>
          <Type>
            Logged in as{" "}
            <Type as="span" color="color-highlightColor">
              {session?.user?.email}
            </Type>
          </Type>
          <Button self="start" onClick={signOut}>
            Log Out
          </Button>
        </Section>
        <Section>
          <SectionTitle>Subscription</SectionTitle>
          <Type>Free</Type>
        </Section>
      </Page>
    </Box>
  );
}

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit } = useForm();
  const onSubmit = useCallback(({ email }: { email: string }) => {
    (async () => {
      try {
        setLoading(true);
        const { error } = await supabase.auth.signIn({ email });
        if (error) throw error;
        alert("Check your email for the login link!");
      } catch (error) {
        if (isError(error)) setError(error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return (
    <Box className={styles.Wrapper} self="normal center" pt={8}>
      <Section
        content="start center"
        as="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Box as="label" gap={4} flow="column" items="center normal">
          <Type>Enter your email address:</Type>
          <Input
            {...register("email", { required: true })}
            disabled={loading}
          />
          <Button type="submit">Log In</Button>
        </Box>
        {error && <Type>{error}</Type>}
        {loading && <Spinner />}
      </Section>
    </Box>
  );
}
