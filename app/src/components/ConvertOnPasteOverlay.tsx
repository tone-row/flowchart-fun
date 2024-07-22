import { useDoc } from "../lib/useDoc";
import { useEffect, useMemo } from "react";
import { getDefaultText } from "../lib/getDefaultText";
import { useEditorStore } from "../lib/useEditorStore";
import { usePromptStore, useRunAiWithStore } from "../lib/usePromptStore";
import { ArrowRight } from "phosphor-react";
import { Button2 } from "../ui/Shared";
import { Trans } from "@lingui/macro";
import { MagicWand } from "phosphor-react";

/**
 * Watch the current state of the graph and the users actions and determine
 * which, if any, AI tools to display to the user.
 */
export function ConvertOnPasteOverlay() {
  const text = useDoc((state) => state.text);
  const defaultText = useMemo(() => {
    return getDefaultText();
  }, []);
  const isDefaultText = text === defaultText;
  // const selection = useEditorStore((s) => s.selection);
  // const fullTextSelected = selection.trim() === text.trim();
  const userPasted = useEditorStore((s) => s.userPasted);
  const enoughCharacters = text.length > 150;
  const lastResult = usePromptStore((s) => s.lastResult);

  // Set the user pasted back to false after 15 seconds, and on unmount
  useEffect(() => {
    if (userPasted) {
      const timeout = setTimeout(() => {
        useEditorStore.setState({ userPasted: "" });
      }, 10000);
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
    (!isDefaultText && enoughCharacters && lastResult !== text && userPasted);

  if (showConvertToFlowchart) return <Overlay />;

  return null;
}

/**
 * This is positioned at the bottom across the whole screen
 */
function Overlay() {
  const runAiWithStore = useRunAiWithStore();
  const isRunning = usePromptStore((s) => s.isRunning);
  const pasted = useEditorStore((s) => s.userPasted);
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 convert-on-paste-overlay dark:from-purple-900/95 dark:via-purple-850/95 dark:to-purple-800/95 pb-8 pt-16 animate-overlayShow">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-screen max-w-4xl mx-auto px-6 animate-slideUpFadeLarge">
        <p className="dark:text-purple-100 text-lg font-semibold text-wrap-balance leading-snug">
          <Trans>
            Is this a document? Would you like to convert it to a flowchart?
          </Trans>
        </p>
        <div className="flex gap-4">
          <Button2
            color="inverted"
            size="sm"
            onClick={() => {
              useEditorStore.setState({ userPasted: "" });
            }}
          >
            <Trans>Dismiss</Trans>
          </Button2>
          <Button2
            color="purple"
            size="sm"
            className="group"
            leftIcon={<MagicWand size={20} weight="fill" />}
            onClick={() => {
              // first set the mode to convert, and add pasted text
              usePromptStore.setState({
                mode: "convert",
                currentText: pasted,
              });
              // move this off the main thread
              requestAnimationFrame(() => {
                runAiWithStore();
                // clear the pasted text
                useEditorStore.setState({ userPasted: "" });
              });
            }}
            rightIcon={
              <ArrowRight
                size={20}
                weight="bold"
                className="inline-block ml-2 group-hover:translate-x-1 transition-transform"
              />
            }
            isLoading={isRunning}
          >
            <Trans>Convert</Trans>
          </Button2>
        </div>
      </div>
    </div>
  );
}
