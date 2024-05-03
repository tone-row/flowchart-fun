import { Trans } from "@lingui/macro";

import { docToString, useDoc } from "../lib/useDoc";
import { Button2 } from "../ui/Shared";
import { useContext } from "react";
import { AppContext } from "./AppContextProvider";
import { getFunFlowchartName } from "../lib/getFunFlowchartName";
import { languages } from "../locales/i18n";
import { useHasProAccess, useUserId } from "../lib/hooks";
import { makeChart, queryClient } from "../lib/queries";
import { useMutation } from "react-query";

export function CloneButton() {
  const hasProAccess = useHasProAccess();
  const language = useContext(AppContext).language;
  const userId = useUserId();
  const makeChartMutation = useMutation(
    "makeChart",
    async () => {
      if (!userId) throw new Error("No user id");
      const name = getFunFlowchartName(language as keyof typeof languages);
      const fullText = docToString(useDoc.getState());
      const response = await makeChart({
        name,
        user_id: userId,
        chart: fullText,
      });
      return response;
    },
    {
      retry: false,
      onSuccess: (response: any) => {
        queryClient.invalidateQueries(["auth", "hostedCharts"]);
        window.open(`/u/${response.data[0].id}`, "_blank");
      },
    }
  );
  if (!hasProAccess) return null;
  return (
    <Button2
      color="blue"
      isLoading={makeChartMutation.isLoading}
      onClick={() => {
        makeChartMutation.mutate();
      }}
      data-session-activity="Clone Chart"
    >
      <Trans>Clone</Trans>
    </Button2>
  );
}
