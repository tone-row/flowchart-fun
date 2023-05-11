import { Trans } from "@lingui/macro";
import { Translate } from "phosphor-react";

import { Box } from "../slang";

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
      <span className="text-xs text-black">
        <Trans>Sorry! This page is only available in English.</Trans>
      </span>
    </Box>
  );
}
