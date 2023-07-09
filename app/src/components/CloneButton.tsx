import { Trans } from "@lingui/macro";
import { CopySimple } from "phosphor-react";
import { useHistory } from "react-router-dom";

import { randomChartName, titleToLocalStorageKey } from "../lib/helpers";
import { docToString, useDoc } from "../lib/useDoc";
import { Button2 } from "../ui/Shared";

export function CloneButton() {
  const { push } = useHistory();
  const fullText = useDoc((s) => docToString(s));
  return (
    <Button2
      color="blue"
      onClick={() => {
        const newChartTitle = randomChartName();
        window.localStorage.setItem(
          titleToLocalStorageKey(newChartTitle),
          fullText ?? ""
        );
        push(`/${newChartTitle}`);
      }}
      rightIcon={<CopySimple size={16} />}
    >
      <Trans>Clone</Trans>
    </Button2>
  );
}
