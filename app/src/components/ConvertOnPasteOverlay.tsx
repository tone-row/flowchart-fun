import { useDoc } from "../lib/useDoc";
import { useEffect, useMemo } from "react";
import { getDefaultText } from "../lib/getDefaultText";
import { useEditorStore } from "../lib/useEditorStore";
import { usePromptStore, useRunAiWithStore } from "../lib/usePromptStore";
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
  const userPasted = useEditorStore((s) => s.userPasted);
  const pastedContent = userPasted || "";
  const pastedLines = pastedContent
    .split("\n")
    .filter((line) => line.trim() !== "");
  const isPastedContentLong =
    pastedLines.length >= 3 ||
    (pastedLines.length === 1 && pastedContent.length >= 100);
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

  // Updated conditions for showing Convert to Flowchart button
  const showConvertToFlowchart =
    !isDefaultText && isPastedContentLong && lastResult !== text && userPasted;

  if (showConvertToFlowchart) return <Overlay />;

  return null;
}

/**
 * This is positioned at the bottom across the whole screen
 */
function Overlay() {
  const { runAi: runAiWithStore } = useRunAiWithStore();
  const isRunning = usePromptStore((s) => s.isRunning);
  const pasted = useEditorStore((s) => s.userPasted);
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-purple-800/80 backdrop-blur-lg py-6 animate-overlayShow">
      <div className="grid sm:flex items-center gap-4 w-screen mx-auto px-6 animate-slideUpFadeLarge">
        <p className="text-white text-sm font-semibold leading-tight text-wrap-balance">
          <Trans>
            Pasted content detected. Convert to Flowchart Fun syntax?
          </Trans>
        </p>
        <div className="flex justify-end gap-3">
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
            leftIcon={<MagicWand size={18} weight="fill" />}
            onClick={() => {
              usePromptStore.setState({
                mode: "convert",
                currentText: pasted,
              });
              requestAnimationFrame(() => {
                runAiWithStore();
                useEditorStore.setState({ userPasted: "" });
              });
            }}
            isLoading={isRunning}
          >
            <Trans>Convert</Trans>
          </Button2>
        </div>
      </div>
    </div>
  );
}
