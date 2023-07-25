import { Trans } from "@lingui/macro";
import * as Popover from "@radix-ui/react-popover";
import { Translate } from "phosphor-react";

import { IconButton2, popoverContentProps } from "../ui/Shared";

/**
 * A warning message that a particular page is only available in English.
 */
export function OnlyInEnglish() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <IconButton2 size="xs">
          <Translate size={16} />
        </IconButton2>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content {...popoverContentProps}>
          <Trans>Sorry! This page is only available in English.</Trans>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
