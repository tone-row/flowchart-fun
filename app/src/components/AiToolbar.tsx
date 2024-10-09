import { Button2, IconButton2, Textarea } from "../ui/Shared";
import { CaretDown, CaretUp, MagicWand, Stop } from "phosphor-react";
import cx from "classnames";
import { t, Trans } from "@lingui/macro";
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
import { getDefaultText } from "../lib/getDefaultText";
import { useMemo } from "react";
import { useDoc } from "../lib/useDoc";

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

export function AiToolbar() {
  const isOpen = usePromptStore((state) => state.isOpen);
  const currentMode = usePromptStore((state) => state.mode);
  const isRunning = usePromptStore((state) => state.isRunning);
  const { runAi, cancelAi } = useRunAiWithStore();
  const diff = usePromptStore((state) => state.diff);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleModeChange = (mode: Mode) => {
    if (mode === currentMode && isOpen) {
      setIsOpen(false);
    } else {
      setMode(mode);
      setIsOpen(true);
    }
  };

  const currentText = usePromptStore((state) => state.currentText);

  const text = useDoc((state) => state.text);
  const defaultText = useMemo(() => {
    return getDefaultText();
  }, []);
  const isTextEditable = Boolean(text) && text !== defaultText;
  const showAcceptDiffButton = diff && !isRunning;

  return (
    <div className="bg-white dark:bg-foreground border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-0.5">
          <MagicWand
            size={20}
            className={cx("mx-2 transition-all duration-200", {
              "text-purple-600 dark:text-purple-200 scale-110 -rotate-12":
                isOpen,
              "text-neutral-500 dark:text-neutral-400": !isOpen,
            })}
          />
          {!showAcceptDiffButton ? (
            (["prompt", "convert", "edit"] as Mode[]).map((mode) => {
              // If the mode is edit and the text is not editable, don't show the button
              if (mode === "edit" && !isTextEditable) {
                return null;
              }

              return (
                <Button2
                  key={mode}
                  color={mode === currentMode && isOpen ? "purple" : "default"}
                  size="xs"
                  onClick={() => handleModeChange(mode)}
                  className={cx("disabled:opacity-50", {
                    "dark:hover:bg-neutral-700": mode !== currentMode,
                    "dark:bg-purple-700 dark:text-purple-100":
                      mode === currentMode && isOpen,
                  })}
                >
                  {getModeTitle(mode)}
                </Button2>
              );
            })
          ) : (
            <span className="text-sm text-purple-600 dark:text-white">
              <Trans>Keep changes?</Trans>
            </span>
          )}
        </div>
        {!showAcceptDiffButton ? (
          <>
            <div className="relative">
              <IconButton2
                onClick={toggleOpen}
                color="default"
                size="xs"
                className="flex items-center justify-center dark:bg-neutral-800 dark:text-neutral-400"
                isLoading={isRunning}
              >
                {!isOpen ? (
                  <CaretDown size={16} weight="bold" />
                ) : (
                  <CaretUp size={16} weight="bold" />
                )}
              </IconButton2>
              {isRunning ? (
                <IconButton2
                  color="red"
                  size="xs"
                  className="flex items-center justify-center !absolute top-0 left-0 opacity-0 hover:opacity-100"
                  onClick={cancelAi}
                >
                  <Stop size={16} weight="bold" />
                </IconButton2>
              ) : null}
            </div>
          </>
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
          <p className="text-xs font-medium text-neutral-400 dark:text-neutral-400 mb-1 text-wrap-balance leading-normal">
            {getModeDescription(currentMode)}
          </p>
          <Textarea
            value={currentText}
            box={{
              className:
                "bg-white dark:bg-neutral-800 !rounded-md w-full mb-1 border border-neutral-400/50 dark:border-neutral-700 rounded-md focus:ring-neutral-500 focus:border-neutral-500",
            }}
            onChange={(e) => setCurrentText(e.target.value)}
            className="resize-none text-neutral-900 dark:text-neutral-100 bg-transparent"
            disabled={isRunning}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                runAi();
              }
            }}
          />
          <div className="flex justify-end">
            <Button2
              color="purple"
              size="xs"
              className="dark:bg-purple-700 dark:hover:bg-purple-600 dark:text-purple-100"
              disabled={isRunning}
              onClick={runAi}
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
