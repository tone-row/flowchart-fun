import { create } from "zustand";
import { RATE_LIMIT_EXCEEDED, runAi } from "./runAi";
import { isError } from "./helpers";
import { useCallback, useContext } from "react";
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

  const handleError = useCallback(
    (error: Error) => {
      if (!hasProAccess && error.message === RATE_LIMIT_EXCEEDED) {
        // Show paywall
        showPaywall({
          title: t`Transform text into diagrams instantly`,
          content: t`Uh oh, you're out of free requests! Upgrade to Flowchart Fun Pro for unlimited diagram conversions, and keep transforming text into clear, visual flowcharts as easily as copy and paste.`,
          imgUrl: "/images/ai-convert.png",
          toPricingCode: "ConvertToFlowchart",
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

  return useCallback(() => {
    const store = usePromptStore.getState();
    if (store.isRunning) return;

    // close the toolbar
    setIsOpen(false);
    startConvert();

    // If we're creating, we need to unfreeze the editor
    if (store.mode === "convert" || store.mode === "prompt") {
      unfreezeDoc();
    }

    runAi({ endpoint: store.mode, prompt: store.currentText, sid })
      .catch((err) => {
        if (isError(err)) handleError(err);
      })
      .then((result) => {
        // Just in case there is an error, run repair text on the result
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
      });
  }, [handleError, sid]);
}
