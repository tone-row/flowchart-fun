import * as Dialog from "@radix-ui/react-dialog";
import { Overlay, Content } from "../ui/Dialog";
import { useSandboxWarning } from "../lib/useSandboxWarning";
import { useDoc } from "../lib/useDoc";
import produce from "immer";
import { Link } from "react-router-dom";
import { Button2 } from "../ui/Shared";

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
          maxWidthClass="max-w-xl w-[calc(100%-3rem)]"
        >
          <h2 className="font-bold text-lg leading-normal text-center">
            Welcome to Your Sandbox
          </h2>
          <P>
            You're currently creating in your Sandbox, a space for free
            experimentation. Remember, it resets daily, so your current work
            won't be saved tomorrow.
          </P>
          <P>
            Want to keep your flowcharts? Upgrade to our Pro account. With Pro,
            you can save unlimited flowcharts and never lose your creativity.
          </P>
          <P>
            Consider upgrading today and unlock the full potential of our app!
          </P>
          <Button2 color="blue" size="sm" className="mt-3">
            <Link to="/pricing">View Pricing</Link>
          </Button2>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-neutral-700 leading-normal text-sm">{children}</p>;
}
