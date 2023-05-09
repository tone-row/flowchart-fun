import { Trans } from "@lingui/macro";
import { Translate } from "phosphor-react";

import { Box, Type } from "../slang";

/**
 * A warning message that a particular page is only available in English.
 */
export function OnlyInEnglish() {
  return (
    <Box
      p={2}
      px={3}
      rad={2}
      background="palette-yellow-2"
      flow="column"
      gap={2}
      color="palette-black-0"
      items="center"
    >
      <Translate size={24} />
      <Type as="span" size={-1} color="palette-black-0">
        <Trans>Sorry! This page is only available in English.</Trans>
      </Type>
    </Box>
  );
}
