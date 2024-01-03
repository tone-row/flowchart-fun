import { Trans, t } from "@lingui/macro";
import * as Tabs from "@radix-ui/react-tabs";
import { useRef } from "react";
import classNames from "classnames";

const btn =
  "bg-white text-neutral-700 px-6 py-3 text-[18px] opacity-50 font-bold aria-[selected=false]:hover:opacity-80";
const selected =
  "aria-[selected=true]:opacity-100 aria-[selected=true]:shadow-xl";

export function EditorTabList() {
  const tabsListRef = useRef<HTMLDivElement>(null);

  return (
    <Tabs.List
      className="grid grid-flow-col gap-1 justify-start"
      ref={tabsListRef}
    >
      <Tabs.Trigger
        value="Document"
        data-testid="Editor Tab: Document"
        className={classNames(btn, selected)}
      >
        <span data-text={t`Document`}>
          <Trans>Document</Trans>
        </span>
      </Tabs.Trigger>
      <Tabs.Trigger
        value="Theme"
        data-testid="Editor Tab: Theme"
        className={classNames(btn, selected)}
      >
        <span data-text={t`Theme`}>
          <Trans>Theme</Trans>
        </span>
      </Tabs.Trigger>
    </Tabs.List>
  );
}
