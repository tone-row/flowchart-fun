import * as Dialog from "@radix-ui/react-dialog";
import { Content, Overlay } from "../ui/Dialog";
import { X } from "phosphor-react";
import { Trans } from "@lingui/macro";
import { Button2 } from "../ui/Shared";
import { useNavigate } from "react-router-dom";
import { create } from "zustand";

export const usePaywallModalStore = create<{
  open: boolean;
  title: string;
  content: string;
}>((_set) => ({
  open: false,
  title: "",
  content: "",
}));

export function PaywallModal() {
  const navigate = useNavigate();
  const open = usePaywallModalStore((s) => s.open);
  const title = usePaywallModalStore((s) => s.title);
  const content = usePaywallModalStore((s) => s.content);
  return (
    <Dialog.Root
      modal
      open={open}
      onOpenChange={(open) => {
        usePaywallModalStore.setState({ open });
      }}
    >
      <Dialog.Portal>
        <Overlay />
        <Content
          maxWidthClass="max-w-[520px]"
          className="content-start text-center"
          noPadding
        >
          <img
            src="/images/paywall.png"
            alt="Importing Data from Lucidchart, Google Sheets, and Visio"
            className="rounded-t-lg max-h-[300px] w-full object-cover object-center"
          />
          <Dialog.Title className="text-lg font-bold inline-flex items-center text-blue-500 bg-background dark:bg-foreground rounded-lg px-4 pl-3 py-3 justify-center mx-auto -mt-6 relative">
            {title}
          </Dialog.Title>
          <Dialog.Description asChild>
            <div className="grid gap-3 p-8 pt-2 text-left">
              <p className="leading-6 text-sm text-neutral-500 dark:text-neutral-400">
                {content}
              </p>
              <Dialog.Close asChild>
                <Button2
                  color="blue"
                  className="mt-4"
                  onClick={() => {
                    navigate("/pricing");
                  }}
                >
                  <Trans>Learn More</Trans>
                </Button2>
              </Dialog.Close>
            </div>
          </Dialog.Description>
          <Dialog.Close className="absolute top-4 right-4 text-neutral-500 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
            <X />
          </Dialog.Close>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
