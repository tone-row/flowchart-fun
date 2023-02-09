import { Trans } from "@lingui/macro";

import { LoginForm } from "../components/LoginForm";
import { Page } from "../components/Shared";
import { Box, Type } from "../slang";
import styles from "./LogIn.module.css";

export function LogIn() {
  return (
    <Box pt={20} px={8}>
      <Page content="start stretch">
        <LoginBlock />
      </Page>
    </Box>
  );
}

function LoginBlock() {
  return (
    <Box p={6} pt={5} rad={3} className={styles.LogInContainer}>
      <LoginForm
        heading={
          <Type size={2} weight="700">
            <Trans>Log In</Trans>
          </Type>
        }
      />
    </Box>
  );
}
