import { Trans } from "@lingui/macro";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash } from "phosphor-react";
import { useState } from "react";

import { Content, Overlay } from "../ui/Dialog";
import { Button2, IconButton2 } from "../ui/Shared";
import { SectionTitle } from "../ui/Typography";

export function ClearTextButton({ handleClear }: { handleClear: () => void }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <Dialog.Root open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <Dialog.Trigger asChild>
        <IconButton2 className="!absolute bottom-1 right-1 md:hidden">
          <Trash size={16} />
        </IconButton2>
      </Dialog.Trigger>
      <Overlay />
      <Content>
        <SectionTitle>
          <Trans>Clear text?</Trans>
        </SectionTitle>
        <div className="flex flex-row justify-between items-center">
          <Button2 onClick={() => setDialogOpen(false)}>
            <Trans>Cancel</Trans>
          </Button2>
          <Button2
            onClick={() => {
              handleClear();
              setDialogOpen(false);
            }}
            color="red"
          >
            <Trans>Clear</Trans>
          </Button2>
        </div>
      </Content>
    </Dialog.Root>
  );
}
