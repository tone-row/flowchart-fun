import { t } from "@lingui/macro";
import { IoMdHelp } from "react-icons/io";

import { Box, BoxProps } from "../slang";
import styles from "./HelpButton.module.css";

export function HelpButton(props: BoxProps) {
  return (
    <Box
      as="button"
      content="center"
      onClick={() => {
        window.flowchartFunSetHelpText && window.flowchartFunSetHelpText();
        window.plausible("Set Help Text");
      }}
      {...props}
      className={styles.HelpButton}
      title={t`Help`}
    >
      <IoMdHelp size={24} />
    </Box>
  );
}
