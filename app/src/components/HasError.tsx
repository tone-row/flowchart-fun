import { Trans } from "@lingui/macro";
import { AnimatePresence, motion } from "framer-motion";
import { BiErrorCircle } from "react-icons/bi";

import { Box, Type } from "../slang";
import styles from "./HasError.module.css";

export default function HasError({ show = false }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: "spring", duration: 0.2 }}
        >
          <Box
            className={styles.HasError}
            flow="column"
            columnGap={1}
            items="center"
          >
            <BiErrorCircle size={24} />
            <Type size={-1}>
              <Trans>Text Invalid</Trans>
            </Type>
          </Box>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
