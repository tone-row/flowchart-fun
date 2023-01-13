import { Trans } from "@lingui/macro";

import { LoginForm } from "../components/LoginForm";
import { Page } from "../components/Shared";
import { Box, Type } from "../slang";

export function LogIn() {
  return (
    <Box>
      <Page content="center">
        <LoginBlock />
      </Page>
    </Box>
  );
}

function LoginBlock() {
  return (
    <Box p={8} pt={7} background="palette-white-2" rad={3}>
      <LoginForm
        heading={
          <Type style={{ textAlign: "center" }} color="palette-black-0">
            <Trans>Already a sponsor? Log in here</Trans>
          </Type>
        }
      />
    </Box>
  );
}
