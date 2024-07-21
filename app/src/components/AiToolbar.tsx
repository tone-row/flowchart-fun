import classNames from "classnames";
import { globalZ } from "../lib/globalZ";
import { useDoc } from "../lib/useDoc";
import { useEffect, useMemo } from "react";
import { getDefaultText } from "../lib/getDefaultText";
import { useEditorStore } from "../lib/useEditorStore";
import { ConvertToFlowchart } from "./ConvertToFlowchart";
import { EditWithAI } from "./EditWithAI";
import { usePromptStore } from "../lib/usePromptStore";

/**
 * Watch the current state of the graph and the users actions and determine
 * which, if any, AI tools to display to the user.
 */
export function AiToolbar() {
  const text = useDoc((state) => state.text);
  const defaultText = useMemo(() => {
    return getDefaultText();
  }, []);
  const isDefaultText = text === defaultText;
  const selection = useEditorStore((s) => s.selection);
  const fullTextSelected = selection.trim() === text.trim();
  const userPasted = useEditorStore((s) => s.userPasted);
  const enoughCharacters = text.length > 150;
  const lastResult = usePromptStore((s) => s.lastResult);

  // Set the user pasted back to false after 15 seconds, and on unmount
  useEffect(() => {
    if (userPasted) {
      const timeout = setTimeout(() => {
        useEditorStore.setState({ userPasted: "" });
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [userPasted]);

  const convertIsRunning = usePromptStore((s) => s.isRunning);

  // Qualities for displaying Convert to Flowchart button:
  //  OR
  //    Convert is currently running
  //    AND
  //      Is not the default text
  //      There is more than 150 characters
  //      Text is not equal to the last result
  //      OR
  //        Full text is selected and is more than 150 characters
  //        Less than 15 seconds have passed since user pasted more than 150 characters
  const showConvertToFlowchart =
    convertIsRunning ||
    (!isDefaultText &&
      enoughCharacters &&
      lastResult !== text &&
      (fullTextSelected || userPasted));

  return (
    <div
      className={classNames(
        "drop-shadow-lg absolute bottom-2 right-2",
        globalZ.editWithAiButton
      )}
    >
      {showConvertToFlowchart ? <ConvertToFlowchart /> : <EditWithAI />}
    </div>
  );
}
