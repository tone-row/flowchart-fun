import { Trans } from "@lingui/macro";
import { LockSimple } from "phosphor-react";
import { useNavigate } from "react-router-dom";

import { Button2 } from "../ui/Shared";

/**
 * Warning shown at the top of a hosted chart when the user can no longer
 * edit it because they don't have Pro access (lapsed subscription or
 * expired 30-Day Pass). The chart stays viewable and exportable.
 */
export function ReadOnlyNotice() {
  const navigate = useNavigate();
  return (
    <div
      data-testid="read-only-notice"
      className="flex flex-wrap items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 mb-2 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
    >
      <LockSimple size={20} className="shrink-0" />
      <p className="text-sm grow text-wrap-pretty">
        <Trans>
          This chart is read-only because you no longer have Pro access. Upgrade
          to resume editing, or use Download to save a copy.
        </Trans>
      </p>
      <Button2
        color="blue"
        data-to-pricing="Read-only Notice"
        onClick={() => {
          navigate("/pricing");
        }}
      >
        <Trans>Upgrade to Pro</Trans>
      </Button2>
    </div>
  );
}
