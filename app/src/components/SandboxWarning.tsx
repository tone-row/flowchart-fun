import * as Dialog from "@radix-ui/react-dialog";
import { Overlay, Content } from "../ui/Dialog";
import { useSandboxWarning } from "../lib/useSandboxWarning";
import { useDoc } from "../lib/useDoc";
import produce from "immer";
import { Link } from "react-router-dom";
import { Button2 } from "../ui/Shared";
import { Trans } from "@lingui/macro";

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
          <h2 className="font-bold text-xl leading-normal text-center">
            <Trans>Your Work is Important</Trans>
          </h2>
          <P>
            <Trans>
              This is your sandbox. It's a great place for experimentation, but{" "}
              <u className="underline-offset-2">it resets daily</u>.
            </Trans>
          </P>
          <P>
            <Trans>
              You can save unlimited flowcharts in the cloud or to your
              computer, as well as get access to features like AI Editing and
              Data Imports for less than the price of a cup of coffee.
            </Trans>
          </P>
          <Button2
            color="purple"
            size="sm"
            className="mt-3"
            data-testid="sandbox-warning-learn-more"
            onClick={() => {
              useSandboxWarning.setState({ isOpen: false });
            }}
          >
            <Link to="/pricing">
              Learn about <span>Flowchart Fun Pro</span>
            </Link>
          </Button2>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-neutral-700 dark:text-neutral-300 leading-normal text-sm">
      {children}
    </p>
  );
}
