import { create } from "zustand";
import { RATE_LIMIT_EXCEEDED, runAi } from "./runAi";
import { useCallback, useContext, useState } from "react";
import { useHasProAccess } from "./hooks";
import { showPaywall } from "./usePaywallModalStore";
import { t } from "@lingui/macro";
import { useEditorStore } from "./useEditorStore";
import { AppContext } from "../components/AppContextProvider";
import { unfreezeDoc } from "./useIsFrozen";
import { useDoc } from "./useDoc";
import { repairText } from "./repairText";

export type Mode = "prompt" | "convert" | "edit";
type PromptStore = {
  /** Whether we're currently converting text */
  isRunning: boolean;
  /** The last result from running a conversion */
  lastResult: string | null;
  /** The error message from the last run, if any */
  error: string | null;
  /** The user's current text in the AI Toolbar */
  currentText: string;
  /** The current mode of the AI Toolbar */
  mode: Mode;
  /** Whether the AI Toolbar is open */
  isOpen: boolean;
  /** The current diff */
  diff: string | null;
};

export const usePromptStore = create<PromptStore>(() => ({
  isRunning: false,
  lastResult: null,
  error: null,
  currentText: "",
  mode: "prompt",
  isOpen: false,
  diff: null,
}));

export function startConvert() {
  usePromptStore.setState({ isRunning: true });
}

export function stopConvert() {
  usePromptStore.setState({ isRunning: false });
}

export function setLastResult(result: string) {
  usePromptStore.setState({ lastResult: result });
}

export function setError(error: string) {
  usePromptStore.setState({ error });
}

export function setCurrentText(text: string) {
  usePromptStore.setState({ currentText: text });
}

export function setMode(mode: Mode) {
  usePromptStore.setState({ mode, currentText: "" });
}

export function setIsOpen(isOpen: boolean) {
  usePromptStore.setState({ isOpen });
}

export function setDiff(diff: string) {
  usePromptStore.setState({ diff });
}

export function acceptDiff() {
  const diff = usePromptStore.getState().diff;
  if (!diff) return;
  useDoc.setState({ text: diff });
  usePromptStore.setState({ diff: null, currentText: "" });
}

export function rejectDiff() {
  usePromptStore.setState({ diff: null, currentText: "" });
}

/**
 * Runs the AI and stores results and errors in the store.
 * Shows paywall if the user has exceeded their limit.
 */
export function useRunAiWithStore() {
  const hasProAccess = useHasProAccess();
  const customer = useContext(AppContext).customer;
  const sid = customer?.subscription?.id;
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const handleError = useCallback(
    (error: Error) => {
      if (error.name === "AbortError") {
        setError(t`Operation canceled`);
      } else if (!hasProAccess && error.message === RATE_LIMIT_EXCEEDED) {
        showPaywall({
          title: t`Get Unlimited AI Requests`,
          content: t`You've used all your free AI conversions. Upgrade to Pro for unlimited AI use, custom themes, private sharing, and more. Keep creating amazing flowcharts effortlessly!`,
          movieUrl: "/images/ai-convert.mp4",
          toPricingCode: "ConvertToFlowchart",
          buttonText: t`Unlock Unlimited AI Flowcharts`,
        });
      } else {
        if (error.message === RATE_LIMIT_EXCEEDED) {
          setError(t`Rate limit exceeded. Please try again later.`);
        } else {
          setError(error.message);
        }
      }
    },
    [hasProAccess]
  );

  const runAiCallback = useCallback(() => {
    const store = usePromptStore.getState();
    if (store.isRunning) return;

    setIsOpen(false);
    startConvert();

    if (store.mode === "convert" || store.mode === "prompt") {
      unfreezeDoc();
    }

    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    runAi({
      endpoint: store.mode,
      prompt: store.currentText,
      sid,
      signal: newAbortController.signal,
    })
      .catch(handleError)
      .then((result) => {
        if (result) {
          const text = repairText(result);
          if (text) {
            useDoc.setState({ text });
          }
        }
      })
      .finally(() => {
        stopConvert();
        useEditorStore.setState({ userPasted: "" });
        setAbortController(null);
      });
  }, [handleError, sid]);

  const cancelAi = useCallback(() => {
    if (abortController) {
      abortController.abort();
      stopConvert();
      setAbortController(null);
    }
  }, [abortController]);

  return { runAi: runAiCallback, cancelAi };
}
