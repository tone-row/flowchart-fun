import { t, Trans } from "@lingui/macro";
import { Trash } from "phosphor-react";
import { useState } from "react";

import { Box } from "../slang";
import { Button2, Dialog, smallIconSize } from "../ui/Shared";
import styles from "./ClearTextButton.module.css";

export function ClearTextButton({ handleClear }: { handleClear: () => void }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <Box
        as="button"
        p={2}
        rad={1}
        className={styles.ClearTextButton}
        onClick={() => setDialogOpen((x) => !x)}
      >
        <Trash size={smallIconSize} />
      </Box>
      <Dialog
        innerBoxProps={{
          gap: 3,
          flow: "column",
          items: "center normal",
          template: "auto / minmax(0, 1fr) min-content min-content",
        }}
        dialogProps={{
          isOpen: dialogOpen,
          onDismiss: () => setDialogOpen(false),
          "aria-label": t`Clear text?`,
        }}
      >
        <Trans>Clear text?</Trans>
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
      </Dialog>
    </>
  );
}
