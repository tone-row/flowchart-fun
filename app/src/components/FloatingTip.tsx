import { Trans } from "@lingui/macro";
import { Lightbulb } from "phosphor-react";
import { useDoc } from "../lib/useDoc";
import { getDefaultText } from "../lib/getDefaultText";

/**
 * A small floating tip to the user that appears centered at the bottom of the wrapper
 */
export function FloatingTip() {
  const text = useDoc((state) => state.text);
  if (text !== getDefaultText()) return null;
  return (
    <p className="absolute bottom-0 p-8 text-xs text-gray-500 dark:text-gray-400 left-0 right-0 flex items-center justify-center">
      <Lightbulb size={16} className="mr-2" />
      <Trans>
        Want to create a flowchart from a document? Paste it in the editor and
        click 'Convert to Flowchart'
      </Trans>
    </p>
  );
}
