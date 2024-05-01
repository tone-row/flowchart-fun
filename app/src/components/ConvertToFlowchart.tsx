import { Trans, t } from "@lingui/macro";
import { Button2 } from "../ui/Shared";
import { TreeStructure } from "phosphor-react";
import { useDoc } from "../lib/useDoc";
import * as Toast from "@radix-ui/react-toast";
import {
  RATE_LIMIT_EXCEEDED,
  convertToFlowchart,
} from "../lib/convertToFlowchart";
import {
  startConvert,
  stopConvert,
  usePromptStore,
} from "../lib/usePromptStore";
import { useEditorStore } from "../lib/useEditorStore";
import { useCallback, useContext, useState } from "react";
import { AppContext } from "./AppContextProvider";
import { isError } from "../lib/helpers";
import { useIsProUser } from "../lib/hooks";
import { showPaywall } from "../lib/usePaywallModalStore";

export function ConvertToFlowchart() {
  const convertIsRunning = usePromptStore((s) => s.convertIsRunning);
  const customer = useContext(AppContext).customer;
  const sid = customer?.subscription?.id;
  const isProUser = useIsProUser();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle the error based on status
  const handleError = useCallback(
    (error: Error) => {
      if (!isProUser && error.message === RATE_LIMIT_EXCEEDED) {
        // Show paywall
        showPaywall({
          title: t`Transform text into diagrams instantly`,
          content: t`Uh oh, you're out of free requests! Upgrade to Flowchart Fun Pro for unlimited diagram conversions, and keep transforming text into clear, visual flowcharts as easily as copy and paste.`,
          imgUrl: "/images/ai-convert.png",
          toPricingCode: "ConvertToFlowchart",
        });
      } else {
        if (error.message === RATE_LIMIT_EXCEEDED) {
          setErrorMessage(t`Rate limit exceeded. Please try again later.`);
        } else {
          setErrorMessage(error.message);
        }
      }
    },
    [isProUser]
  );

  return (
    <>
      <Button2
        onClick={() => {
          const prompt = useDoc.getState().text;
          startConvert();
          convertToFlowchart(prompt, sid)
            .catch((err) => {
              if (isError(err)) handleError(err);
            })
            .finally(() => {
              stopConvert();
              useEditorStore.setState({ userPasted: false });
            });
        }}
        disabled={convertIsRunning}
        leftIcon={
          <TreeStructure
            className="group-hover-tilt-shaking md:-mr-1 -mr-4"
            size={18}
          />
        }
        color="green"
        size="sm"
        rounded
        className="!pt-2 !pb-[9px] !pl-3 !pr-4 disabled:!opacity-100"
        data-session-activity="Convert To Flowchart"
        isLoading={convertIsRunning}
      >
        <span className="text-[15px] hidden md:inline">
          <Trans>Convert to Flowchart</Trans>
        </span>
      </Button2>
      <Toast.Root
        type="foreground"
        duration={4000}
        className="ToastRoot bg-red-300 text-red-800 font-bold border-b-2 border-r-2 border-red-500 rounded-md shadow p-4 grid [grid-template-areas:_'title_action'_'description_action'] grid-cols-[auto_max-content] gap-x-4 items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut"
        open={errorMessage !== null}
        onOpenChange={(open) => {
          if (!open) setErrorMessage(null);
        }}
      >
        <Toast.Description>
          <div className="flex text-xs items-center gap-3">
            <p className="leading-normal">{errorMessage}</p>
          </div>
        </Toast.Description>
      </Toast.Root>
    </>
  );
}
