import * as Dialog from "@radix-ui/react-dialog";
import { Overlay, Content } from "../ui/Dialog";
import { useSandboxWarning } from "../lib/useSandboxWarning";
import { useDoc } from "../lib/useDoc";
import produce from "immer";
import { Link } from "react-router-dom";
import { Button2 } from "../ui/Shared";
import { Trans } from "@lingui/macro";
import classNames from "classnames";

/**
 * A modal window that appears for people working in the sandbox after 1 minute.
 * The displaying of the modal is handled by the Sandbox page.
 */
export function SandboxWarning() {
  const isOpen = useSandboxWarning((state) => state.isOpen);
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(isOpen) => {
        useSandboxWarning.setState({ isOpen });
        /**
         * When closed, make a note in the chart not to show it again
         */
        if (!isOpen) {
          useDoc.setState(
            (state) => {
              return produce(state, (draft) => {
                draft.meta.hasSeenSandboxWarning = true;
              });
            },
            false,
            "SandboxWarning/closeSandboxWarning"
          );
        }
      }}
    >
      <Dialog.Portal>
        <Overlay />
        <Content
          className="grid gap-5 p-5 md:p-8"
          maxWidthClass="max-w-lg w-[calc(100%-3rem)]"
          data-testid="sandbox-warning"
        >
          <h2 className="font-bold text-xl leading-tighter text-center text-wrap-balance">
            <Trans>Don't Lose Your Work</Trans>
          </h2>
          <P>
            <Trans>
              This sandbox is perfect for experimenting, but remember - it
              resets daily. Upgrade now and keep your current work!
            </Trans>
          </P>
          <div className="text-sm">
            <p className="font-semibold mb-2">
              <Trans>Upgrade to Flowchart Fun Pro and unlock:</Trans>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <Trans>Unlimited cloud-saved flowcharts</Trans>
              </li>
              <li>
                <Trans>AI-powered editing to supercharge your workflow</Trans>
              </li>
              <li>
                <Trans>Data import feature for complex diagrams</Trans>
              </li>
              <li>
                <Trans>Local saving for offline access</Trans>
              </li>
            </ul>
          </div>
          <P>
            <Trans>
              All this for just $4/month - less than your daily coffee ☕
            </Trans>
          </P>
          <P className="text-sm text-neutral-600 dark:text-neutral-400">
            <Trans>
              Join 2000+ professionals who've upgraded their workflow
            </Trans>
          </P>
          <Button2
            color="purple"
            size="sm"
            className="mt-3"
            data-testid="sandbox-warning-learn-more"
            data-to-pricing="Sandbox Warning"
            data-session-activity="SandboxWarning/upgrade"
            onClick={() => {
              useSandboxWarning.setState({ isOpen: false });
            }}
          >
            <Link to="/pricing">
              <Trans>Upgrade Now - Save My Work</Trans>
            </Link>
          </Button2>
          <Dialog.DialogClose
            className="text-xs text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
            onClick={() => useSandboxWarning.setState({ isOpen: false })}
          >
            <Trans>Continue in Sandbox (Resets daily, work not saved)</Trans>
          </Dialog.DialogClose>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function P({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={classNames(
        "text-neutral-700 dark:text-neutral-300 leading-normal text-sm",
        className
      )}
    >
      {children}
    </p>
  );
}
