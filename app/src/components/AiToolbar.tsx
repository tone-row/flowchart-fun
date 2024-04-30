import classNames from "classnames";
import { globalZ } from "../lib/globalZ";
import { useDoc } from "../lib/useDoc";
import { useEffect, useMemo } from "react";
import { getDefaultText } from "../lib/getDefaultText";
import { useEditorStore } from "../lib/useEditorStore";

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

  // Set the user pasted back to false after 15 seconds, and on unmount
  useEffect(() => {
    if (userPasted) {
      const timeout = setTimeout(() => {
        useEditorStore.setState({ userPasted: false });
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [userPasted]);

  // Qualities for displaying Convert to Flowchart button:
  // Is not the default text
  // AND
  //   Full text is selected and is more than 150 characters
  //   OR
  //   Less than 15 seconds have passed since user pasted more than 150 characters
  const showConvertToFlowchart =
    !isDefaultText && enoughCharacters && (fullTextSelected || userPasted);

  return (
    <div
      className={classNames(
        "absolute top-2 right-2 drop-shadow-lg",
        globalZ.editWithAiButton
      )}
    >
      {showConvertToFlowchart ? (
        <p>Convert to Flowchart</p>
      ) : (
        <p>Default Edit with AI button</p>
      )}
    </div>
  );
}
