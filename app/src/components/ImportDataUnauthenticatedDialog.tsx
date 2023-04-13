import { Trans } from "@lingui/macro";
import * as Dialog from "@radix-ui/react-dialog";
import { Database, X } from "phosphor-react";
import { Link } from "react-router-dom";

import { Content, Overlay } from "../ui/Dialog";
import { EditorActionTextButton } from "../ui/EditorActionTextButton";

export function ImportDataUnauthenticatedDialog() {
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
          className="content-start"
          noPadding
        >
          <img
            src="/images/import-data.png"
            alt="Importing Data from Lucidchart, Google Sheets, and Visio"
            className="rounded-t-lg max-h-[300px] w-full object-cover object-center"
          />
          <Dialog.Title className="text-lg font-bold flex items-center text-blue-500 bg-background rounded-lg px-4 pl-3 py-3 w-48 justify-center mx-auto -mt-6 relative">
            <Database className="mr-2 w-6 h-6" />
            <Trans>Import Data</Trans>
          </Dialog.Title>
          <Dialog.Description asChild>
            <div className="grid gap-3 p-8 pt-4">
              <p className="leading-5 text-sm text-neutral-500">
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
              <p className="leading-5 text-sm text-neutral-500"></p>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4"
              >
                <Trans>Learn More</Trans>
              </Link>
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
