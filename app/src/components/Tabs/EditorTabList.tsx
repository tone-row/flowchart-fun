import { Trans } from "@lingui/macro";
import * as Tabs from "@radix-ui/react-tabs";

import { useIsValidSponsor } from "../../lib/hooks";
import styles from "./EditorTabList.module.css";

const btnDark =
  "dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800";

export function EditorTabList() {
  const isValidSponsor = useIsValidSponsor();

  return (
    <Tabs.List className="grid grid-flow-col gap-2 border-b border-neutral-300 dark:border-neutral-600 pt-2 px-5 pb-0 justify-start">
      <Tabs.Trigger
        value="Document"
        data-testid="Editor Tab: Document"
        className={`${styles.btn} ${btnDark}`}
      >
        <span className="text-sm">
          <Trans>Document</Trans>
        </span>
      </Tabs.Trigger>
      <Tabs.Trigger
        value="Layout"
        data-testid="Editor Tab: Layout"
        className={`${styles.btn} ${btnDark}`}
      >
        <span className="text-sm">
          <Trans>Layout</Trans>
        </span>
      </Tabs.Trigger>
      <Tabs.Trigger
        value="Style"
        data-testid="Editor Tab: Style"
        className={`${styles.btn} ${btnDark}`}
      >
        <span className="text-sm">
          <Trans>Style</Trans>
        </span>
      </Tabs.Trigger>
      {isValidSponsor && (
        <Tabs.Trigger
          value="Advanced"
          data-testid="Editor Tab: Advanced"
          className={`${styles.btn} ${btnDark}`}
        >
          <span className="text-sm">
            <Trans>Advanced</Trans>
          </span>
        </Tabs.Trigger>
      )}
    </Tabs.List>
  );
}
