import { t } from "@lingui/macro";

import { Box } from "../slang";
import { useMobileStore } from "../lib/useMobileStore";

export default function MobileTabToggle() {
  const tab = useMobileStore((state) => state.tab);
  const toggleTab = useMobileStore((state) => state.toggleTab);
  return (
    <Box p={1} at={{ tablet: { display: "none" } }}>
      <Box
        as="button"
        background="palette-purple-0"
        color="palette-white-0"
        rad={1}
        p={3}
        onClick={toggleTab}
      >
        <span className="text-xs">
          {tab === "graph" ? t`Editor` : t`Graph`}
        </span>
      </Box>
    </Box>
  );
}
