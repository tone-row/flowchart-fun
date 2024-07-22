import { Button2, IconButton2, Textarea } from "../ui/Shared";
import { CaretDown, CaretUp, MagicWand } from "phosphor-react";
import cx from "classnames";
import { t } from "@lingui/macro";
import { createExamples } from "../pages/createExamples";
import {
  Mode,
  acceptDiff,
  rejectDiff,
  setCurrentText,
  setIsOpen,
  setMode,
  usePromptStore,
  useRunAiWithStore,
} from "../lib/usePromptStore";

function getModeDescription(mode: Mode): string {
  const prompts = createExamples();
  switch (mode) {
    case "prompt":
      return `E.G., "${prompts[0]}"`;
    case "convert":
      return t`Paste your document or outline here to convert it into an organized flowchart.`;
    case "edit":
      return t`Use this mode to modify and enhance your current chart.`;
  }
}

function getModeTitle(mode: Mode): string {
  switch (mode) {
    case "prompt":
      return t`Prompt`;
    case "convert":
      return t`Convert`;
    case "edit":
      return t`Edit`;
  }
}

export function AiToolbar2() {
  const isOpen = usePromptStore((state) => state.isOpen);
  const currentMode = usePromptStore((state) => state.mode);
  const isRunning = usePromptStore((state) => state.isRunning);
  const runAiWithStore = useRunAiWithStore();
  const diff = usePromptStore((state) => state.diff);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleModeChange = (mode: Mode) => {
    setMode(mode);
    if (!isOpen) setIsOpen(true);
  };

  const currentText = usePromptStore((state) => state.currentText);

  const showAcceptDiffButton = diff && !isRunning;

  return (
    <div className="bg-purple-300/60 dark:bg-purple-800/20">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center space-x-2">
          <MagicWand
            size={24}
            className="text-purple-600 dark:text-white mx-1"
          />
          {!showAcceptDiffButton ? (
            (["prompt", "convert", "edit"] as Mode[]).map((mode) => (
              <Button2
                key={mode}
                color={mode === currentMode ? "purple" : "default"}
                size="xs"
                onClick={() => handleModeChange(mode)}
                className={cx({
                  "hover:bg-white dark:hover:bg-neutral-700":
                    mode !== currentMode,
                  "dark:bg-purple-700 dark:text-purple-100":
                    mode === currentMode,
                })}
              >
                {getModeTitle(mode)}
              </Button2>
            ))
          ) : (
            <span className="text-sm text-purple-600 dark:text-white">
              Keep changes?
            </span>
          )}
        </div>
        {!showAcceptDiffButton ? (
          <IconButton2
            onClick={toggleOpen}
            color="purple"
            size="xs"
            className="flex items-center justify-center dark:bg-purple-700/50 dark:text-purple-100"
            isLoading={isRunning}
          >
            {!isOpen ? <CaretDown size={16} /> : <CaretUp size={16} />}
          </IconButton2>
        ) : (
          <div className="flex space-x-2">
            <Button2 color="green" size="xs" onClick={acceptDiff}>
              Accept
            </Button2>
            <Button2 color="red" size="xs" onClick={rejectDiff}>
              Reject
            </Button2>
          </div>
        )}
      </div>
      {isOpen && (
        <div className="grid p-4 pt-0">
          <p className="text-xs text-purple-600 dark:text-white mb-2 text-wrap-balance leading-normal">
            {getModeDescription(currentMode)}
          </p>
          <Textarea
            value={currentText}
            box={{
              className:
                "bg-white dark:bg-purple-800/50 !rounded-md w-full mb-2 border-2 border-purple-400 dark:border-purple-700 rounded-md focus:ring-purple-500 focus:border-purple-500",
            }}
            onChange={(e) => setCurrentText(e.target.value)}
            className="resize-none dark:text-white dark:bg-transparent"
            disabled={isRunning}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                runAiWithStore();
              }
            }}
          />
          <div className="flex justify-end">
            <Button2
              color="purple"
              size="xs"
              className="dark:bg-purple-700/50 dark:text-purple-100"
              disabled={isRunning}
              onClick={runAiWithStore}
              data-session-activity={`Run AI: ${currentMode}`}
            >
              {!isRunning ? t`Submit` : "..."}
            </Button2>
          </div>
        </div>
      )}
    </div>
  );
}
