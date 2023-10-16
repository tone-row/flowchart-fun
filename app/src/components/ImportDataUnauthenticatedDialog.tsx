import { Trans } from "@lingui/macro";
import * as Dialog from "@radix-ui/react-dialog";
import { Database, X } from "phosphor-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Content, Overlay } from "../ui/Dialog";
import { EditorActionTextButton } from "../ui/EditorActionTextButton";
import { Button2 } from "../ui/Shared";

export function ImportDataUnauthenticatedDialog() {
  useEffect(() => {
    // check if requestIdleCallback is supported
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        // preload /images/import-data.png when the network is idle
        new Image().src = "/images/import-data.png";
      });
    } else {
      // don't preload image
    }
  }, []);
  const navigate = useNavigate();
  return (
    <Dialog.Root modal>
      <Dialog.Trigger asChild>
        <EditorActionTextButton icon={Database}>
          <Trans>Import Data</Trans>
        </EditorActionTextButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Overlay />
        <Content
          maxWidthClass="max-w-[520px]"
          className="content-start text-center"
          noPadding
        >
          <img
            src="/images/import-data.png"
            alt="Importing Data from Lucidchart, Google Sheets, and Visio"
            className="rounded-t-lg max-h-[300px] w-full object-cover object-center"
          />
          <Dialog.Title className="text-lg font-bold inline-flex items-center text-blue-500 bg-background dark:bg-foreground rounded-lg px-4 pl-3 py-3 justify-center mx-auto -mt-6 relative dark:text-white">
            <Database className="mr-2 w-6 h-6" />
            <Trans>Import Data</Trans>
          </Dialog.Title>
          <Dialog.Description asChild>
            <div className="grid gap-3 p-8 pt-4 text-left">
              <p className="leading-5 text-xs text-neutral-500 dark:text-neutral-400">
                <Trans>
                  Import data from any CSV file and map it to a new flowchart.
                  This is a great way to import data from other sources like
                  Lucidchart, Google Sheets, and Visio.
                </Trans>{" "}
                <Trans>
                  Importing data is a pro feature. You can upgrade to Flowchart
                  Fun Pro for just $3/month or $30/year.
                </Trans>
              </p>
              <Button2
                color="blue"
                className="mt-4"
                onClick={() => {
                  navigate("/pricing");
                }}
              >
                <Trans>Learn More</Trans>
              </Button2>
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
