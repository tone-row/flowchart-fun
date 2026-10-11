import { t, Trans } from "@lingui/macro";
import { X } from "phosphor-react";
import { usePostHog } from "posthog-js/react";
import { useLocation, useParams } from "react-router-dom";

import { flowchartChatUrl } from "../lib/flowchartChat";
import { useDoc } from "../lib/useDoc";

export function FlowchartChatBar({ onDismiss }: { onDismiss: () => void }) {
  const posthog = usePostHog();
  const { pathname } = useLocation();
  const params = useParams();
  const withChart = pathname === "/" || "id" in params;

  function setHrefToCurrentChart(anchor: HTMLAnchorElement) {
    if (!withChart) return;
    const { text, details } = useDoc.getState();
    const title = details.isHosted && details.title ? details.title : undefined;
    anchor.href = flowchartChatUrl("banner", { title, text });
  }

  return (
    <div className="flex items-center justify-center gap-3 min-w-0 max-w-[100vw] px-3 py-2 text-xs md:text-sm leading-5 bg-blue-50 text-blue-950 border-b border-blue-100 dark:bg-blue-400/10 dark:text-blue-100 dark:border-blue-400/15">
      <p className="flex items-center gap-1.5 min-w-0 whitespace-nowrap">
        <strong className="font-semibold truncate">
          <Trans>New from Flowchart Fun:</Trans>
        </strong>
        <span className="hidden md:inline truncate shrink-[999]">
          {withChart ? (
            <Trans>
              turn this chart into a step-by-step guide your team can click
              through.
            </Trans>
          ) : (
            <Trans>
              flowchart.chat turns a written process into a flowchart, a
              checklist and a guide.
            </Trans>
          )}
        </span>
        <a
          href={flowchartChatUrl("banner")}
          target="_blank"
          rel="noopener"
          className="shrink-0 font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
          onPointerDown={(e) => setHrefToCurrentChart(e.currentTarget)}
          onClick={(e) => {
            setHrefToCurrentChart(e.currentTarget);
            posthog?.capture("flowchart_chat_bar_clicked", {
              with_chart: withChart,
            });
          }}
        >
          {withChart ? (
            <Trans>Open it in flowchart.chat →</Trans>
          ) : (
            <Trans>Try flowchart.chat →</Trans>
          )}
        </a>
      </p>
      <button
        type="button"
        aria-label={t`Close announcement`}
        className="shrink-0 p-0.5 rounded text-blue-900/70 hover:text-blue-950 hover:bg-blue-100 dark:text-blue-200/70 dark:hover:text-blue-50 dark:hover:bg-blue-400/15"
        onClick={() => {
          posthog?.capture("flowchart_chat_bar_dismissed");
          onDismiss();
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
