import { Trans } from "@lingui/macro";
import { AnimatePresence, motion } from "framer-motion";
import { BiErrorCircle } from "react-icons/bi";
import { Link } from "react-router-dom";

import { useParseError } from "../lib/prepareChart";
import { Box, Type } from "../slang";
import styles from "./EditorError.module.css";

export default function EditorError() {
  const parseError = useParseError((s) => s.error);
  const errorFromStyle = useParseError((s) => s.errorFromStyle);
  const show = parseError || errorFromStyle || "";
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", duration: 0.2 }}
        >
          <Box
            className={styles.EditorError}
            flow="column"
            columnGap={1}
            content="center start"
            items="center"
            p={2}
            rad={2}
            background="palette-orange-0"
          >
            <BiErrorCircle size={24} />
            <Box gap={1}>
              <Type size={-1} weight="700">
                {show}
              </Type>
              <Type as={Link} to="/h" size={-2} style={{ lineHeight: 1 }}>
                <Trans>
                  Need Help? <u>Check out our documentation.</u>
                </Trans>
              </Type>
            </Box>
          </Box>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
