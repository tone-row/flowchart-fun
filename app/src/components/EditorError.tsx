import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";
import { SiCodereview } from "react-icons/si";

import { getParserError, ParserErrorCode } from "../lib/parserErrors";
import { useParseErrorStore } from "../lib/useDoc";

/**
 * Displays an error over top of the text editor.
 */
export default function EditorError() {
  const parseError = useParseErrorStore((s) => s.error);
  const errorFromStyle = useParseErrorStore((s) => s.errorFromStyle);
  const parserErrorCode = useParseErrorStore((s) => s.parserErrorCode);
  let message: ReactNode = parseError || errorFromStyle || "";
  let description: ReactNode = "";
  if (parserErrorCode) {
    const parserError = getParserError(parserErrorCode as ParserErrorCode);
    message = parserError.message;
    description = parserError.resolution;
  }
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", duration: 0.4 }}
        >
          <div className="absolute bottom-2 left-2 right-2 z-10 bg-red-200/90 p-4 rounded-lg">
            <div className="flex gap-4 items-start">
              <SiCodereview
                size={29}
                className="text-red-700 min-w-[29px] mt-[-1px]"
              />
              <div className="grid gap-2 editor-error">
                <h3 className="text-sm font-bold mt-[4px] text-red-700">
                  {message}
                </h3>
                {description ? (
                  <p className="text-xs text-red-900 opacity-80 leading-normal">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
