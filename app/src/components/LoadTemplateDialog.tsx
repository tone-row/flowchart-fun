import * as Dialog from "@radix-ui/react-dialog";
import { Close, Content, Overlay } from "../ui/Dialog";
import { EditorActionTextButton } from "../ui/EditorActionTextButton";
import { FolderOpen } from "phosphor-react";
import { Trans } from "@lingui/macro";

export function LoadTemplateDialog() {
  return (
    <Dialog.Root modal>
      <Dialog.Trigger asChild>
        <EditorActionTextButton icon={FolderOpen}>
          <Trans>Load Template</Trans>
        </EditorActionTextButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Overlay />
        <Content
          overflowV
          maxWidthClass="max-w-[600px]"
          className="content-start overflow-y-auto"
        >
          <Close />
          <Dialog.Title className="text-2xl font-bold flex items-center">
            <FolderOpen className="mr-2" />
            <Trans>Load Template</Trans>
          </Dialog.Title>
          <Dialog.Description asChild>hello</Dialog.Description>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
