import { Trans } from "@lingui/macro";
import * as HoverCard from "@radix-ui/react-hover-card";
import { ReactNode } from "react";

import { useIsProUser } from "../lib/hooks";

/**
 * Returns no wrapper if valid sponsor, otherwise wraps children in a popover
 * that explains why the feature is not available, and has a link to the
 * sponsor page.
 */
export function SvgProOnlyPopover({ children }: { children: ReactNode }) {
  const isProUser = useIsProUser();
  if (isProUser) return <>{children}</>;
  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Content className="no-bg">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 overflow-hidden">
          <p className="text-gray-800 dark:text-gray-100 text-sm">
            <Trans>
              This feature is only available to pro users.{" "}
              <a href="/pricing" className="text-blue-500 hover:underline">
                Become a pro user
              </a>{" "}
              to unlock it.
            </Trans>
          </p>
        </div>
      </HoverCard.Content>
    </HoverCard.Root>
  );
}
