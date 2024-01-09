import { t } from "@lingui/macro";

import { useMobileStore } from "../lib/useMobileStore";
import { Button2 } from "../ui/Shared";

export default function MobileTabToggle() {
  const tab = useMobileStore((state) => state.tab);
  const toggleTab = useMobileStore((state) => state.toggleTab);
  return (
    <div className="md:hidden grid">
      <Button2 onClick={toggleTab} className="rounded-none" color="inverted">
        Go To {tab === "graph" ? t`Editor` : t`Graph`}
      </Button2>
    </div>
  );
}
