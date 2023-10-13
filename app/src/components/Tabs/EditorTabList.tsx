import { Trans, t } from "@lingui/macro";
import * as Tabs from "@radix-ui/react-tabs";

import styles from "./EditorTabList.module.css";
import { useTabsStore } from "../../lib/useTabsStore";
import { useEffect, useRef, useState } from "react";
import classNames from "classnames";

const btnDark =
  "dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800";

export function EditorTabList() {
  const selectedTab = useTabsStore((s) => s.selectedTab);
  const tabsListRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    offsetLeft: 20,
    offsetWidth: 91,
  });
  useEffect(() => {
    if (!tabsListRef.current) return;
    // find the selected tab
    const tabElement = tabsListRef.current.querySelector(
      `[data-state="active"]`
    );
    if (!tabElement) return;
    // get offsetLeft and offsetWidth
    const { offsetLeft, offsetWidth } = tabElement as HTMLDivElement;

    setPosition({ offsetLeft, offsetWidth });
  }, [selectedTab]);

  return (
    <Tabs.List
      className={classNames(
        "grid grid-flow-col gap-4 px-5 pb-0 justify-start border-b border-blue-100",
        styles.TabsList
      )}
      ref={tabsListRef}
      style={{
        // @ts-ignore
        "--tab-offset-left": `${position.offsetLeft}px`,
        "--tab-offset-width": `${position.offsetWidth}px`,
      }}
    >
      <Tabs.Trigger
        value="Document"
        data-testid="Editor Tab: Document"
        className={`${styles.btn} ${btnDark}`}
      >
        <span className="text-sm" data-text={t`Document`}>
          <Trans>Document</Trans>
        </span>
      </Tabs.Trigger>
      <Tabs.Trigger
        value="Theme"
        data-testid="Editor Tab: Theme"
        className={`${styles.btn} ${btnDark}`}
      >
        <span className="text-sm" data-text={t`Theme`}>
          <Trans>Theme</Trans>
        </span>
      </Tabs.Trigger>
    </Tabs.List>
  );
}
