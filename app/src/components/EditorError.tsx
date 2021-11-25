import { AnimatePresence, motion } from "framer-motion";
import { useContext } from "react";
import { BiErrorCircle } from "react-icons/bi";

import { Box, Type } from "../slang";
import { AppContext } from "./AppContext";
import styles from "./EditorError.module.css";

export default function EditorError() {
  const { hasError, hasStyleError } = useContext(AppContext);
  const show = hasError || hasStyleError || false;
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
            <Type size={-1} weight="700">
              {show}
            </Type>
          </Box>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
