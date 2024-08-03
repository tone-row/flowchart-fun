import * as Dialog from "@radix-ui/react-dialog";
import { Content, Overlay } from "../ui/Dialog";
import { X } from "phosphor-react";
import { Trans } from "@lingui/macro";
import { Button2 } from "../ui/Shared";
import { useNavigate } from "react-router-dom";
import { usePaywallModalStore } from "../lib/usePaywallModalStore";

export function PaywallModal() {
  const navigate = useNavigate();
  const open = usePaywallModalStore((s) => s.open);
  const title = usePaywallModalStore((s) => s.title);
  const content = usePaywallModalStore((s) => s.content);
  const movieUrl = usePaywallModalStore((s) => s.movieUrl);
  const imgUrl = usePaywallModalStore((s) => s.imgUrl);
  const toPricingCode = usePaywallModalStore((s) => s.toPricingCode);
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
          className="content-start text-center overflow-auto"
          noPadding
        >
          {movieUrl ? (
            <video
              className="rounded-t-lg max-h-[300px] w-full object-cover object-center bg-neutral-100"
              width={520}
              height={300}
              autoPlay
              loop
              muted
              playsInline
              src={movieUrl}
            />
          ) : (
            <img
              src={imgUrl}
              alt="Importing Data from Lucidchart, Google Sheets, and Visio"
              className="rounded-t-lg max-h-[300px] w-full object-cover object-center"
              width={520}
              height={300}
            />
          )}
          <Dialog.Title className="text-lg font-bold inline-flex items-center text-blue-500 bg-background dark:bg-foreground rounded-lg px-4 pl-3 py-3 justify-center mx-auto -mt-6 relative">
            {title}
          </Dialog.Title>
          <Dialog.Description asChild>
            <div className="grid gap-3 p-8 pt-2 text-left">
              <p className="leading-6 text-sm text-neutral-600 dark:text-neutral-400">
                {content}
              </p>
              <Dialog.Close asChild>
                <Button2
                  color="blue"
                  className="mt-4"
                  data-to-pricing={toPricingCode}
                  onClick={() => {
                    navigate("/pricing");
                  }}
                >
                  <Trans>Learn More</Trans>
                </Button2>
              </Dialog.Close>
            </div>
          </Dialog.Description>
          <Dialog.Close
            data-testid="close-dialog"
            className="absolute top-4 right-4 text-neutral-500 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X />
          </Dialog.Close>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
