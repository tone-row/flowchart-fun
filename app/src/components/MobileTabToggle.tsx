import { t } from "@lingui/macro";
import { useContext } from "react";
import { Box, Type } from "../slang";
import { AppContext } from "./AppContext";
import { smallBtnTypeSize } from "./Shared";

export default function MobileTabToggle() {
  const { toggleMobileEditorTab, mobileEditorTab } = useContext(AppContext);
  return (
    <Box p={1} at={{ tablet: { display: "none" } }}>
      <Box
        as="button"
        background="palette-purple-0"
        color="palette-white-0"
        rad={1}
        p={3}
        onClick={toggleMobileEditorTab}
      >
        <Type size={smallBtnTypeSize} as="span">
          {mobileEditorTab === "graph" ? t`Editor` : t`Graph`}
        </Type>
      </Box>
    </Box>
  );
}
