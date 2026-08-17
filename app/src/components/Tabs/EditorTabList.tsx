import { Trans, t } from "@lingui/macro";
import * as Tabs from "@radix-ui/react-tabs";
import { useRef } from "react";
import classNames from "classnames";
import { useIsReadOnly } from "../../lib/hooks";

// Colour, not opacity, carries the selected state — opacity dimmed the
// background along with the label and made the inactive tabs look disabled.
const btn =
  "bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-500 px-4 py-2.5 md:px-6 md:py-3 text-sm font-semibold rounded-t-lg transition-colors hover:text-neutral-700 dark:hover:text-neutral-300";
const selected =
  "aria-[selected=true]:text-neutral-900 dark:aria-[selected=true]:text-neutral-50 aria-[selected=true]:shadow-md data-[is-selected=true]:text-neutral-900 dark:data-[is-selected=true]:text-neutral-50 data-[is-selected=true]:shadow-md";

export function EditorTabList() {
  const tabsListRef = useRef<HTMLDivElement>(null);
  const isReadOnly = useIsReadOnly();

  return (
    <Tabs.List
      className="grid grid-flow-col gap-1 justify-start"
      ref={tabsListRef}
    >
      <Tabs.Trigger
        value="Document"
        data-testid="Editor Tab: Document"
        className={classNames(btn, selected)}
        data-session-activity="Edit Document"
      >
        <span data-text={t`Document`}>
          <Trans>Document</Trans>
        </span>
      </Tabs.Trigger>
      {isReadOnly ? null : (
        <Tabs.Trigger
          value="Theme"
          data-testid="Editor Tab: Theme"
          className={classNames(btn, selected)}
          data-session-activity="Edit Theme"
        >
          <span data-text={t`Theme`}>
            <Trans>Theme</Trans>
          </span>
        </Tabs.Trigger>
      )}
      <Tabs.Trigger
        value="Graph"
        data-testid="Editor Tab: Graph"
        className={classNames(btn, selected, "md:hidden")}
        data-session-activity="Edit Graph"
      >
        <span data-text={t`Theme`}>
          <Trans>Graph</Trans>
        </span>
      </Tabs.Trigger>
    </Tabs.List>
  );
}
