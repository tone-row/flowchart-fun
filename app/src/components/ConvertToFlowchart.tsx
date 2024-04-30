import { Trans } from "@lingui/macro";
import { Button2 } from "../ui/Shared";
import { TreeStructure } from "phosphor-react";
import { useDoc } from "../lib/useDoc";
import { useState } from "react";
import { convertToFlowchart } from "../lib/convertToFlowchart";

export function ConvertToFlowchart() {
  const [loading, setLoading] = useState(false);
  return (
    <Button2
      onClick={() => {
        const prompt = useDoc.getState().text;
        setLoading(true);
        convertToFlowchart(prompt).finally(() => setLoading(false));
      }}
      disabled={loading}
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
      data-session-activity="Edit with AI: Open"
      isLoading={loading}
    >
      <span className="text-[15px] hidden md:inline">
        <Trans>Convert to Flowchart</Trans>
      </span>
    </Button2>
  );
}
