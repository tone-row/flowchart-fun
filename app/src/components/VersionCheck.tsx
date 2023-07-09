import { Trans } from "@lingui/macro";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { FiRefreshCw } from "react-icons/fi";

import { useCheckVersion, useVersionCheck } from "../lib/versionCheck";
import { Button } from "../ui/Shared";

/** Polls the current app version from the API and opens a reload modal if it changes */
export function VersionCheck() {
  useCheckVersion();
  const showModal = useVersionCheck((state) => state.showModal);
  if (!showModal) return null;
  return (
    <AlertDialog.Root open={showModal}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bg-foreground dark:bg-background opacity-50 data-[state=open]:animate-overlayShow fixed inset-0" />
        <AlertDialog.Content className="data-[state=open]:animate-contentShow bg-background text-foreground dark:bg-foreground dark:text-background fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded bg-background p-4 shadow-lg focus:outline-none z-50 grid gap-4 justify-items-center">
          <AlertDialog.Title className="text-2xl font-bold text-center">
            <Trans>Reload to Update</Trans>
          </AlertDialog.Title>
          <AlertDialog.Description>
            <Trans>
              A new version of the app is available. Please reload to update.
            </Trans>
          </AlertDialog.Description>
          <Button
            as={AlertDialog.Action}
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            <FiRefreshCw />
            <Trans>Refresh Page</Trans>
          </Button>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
