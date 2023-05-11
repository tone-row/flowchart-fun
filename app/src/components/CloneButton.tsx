import { Trans } from "@lingui/macro";
import { FaCopy } from "react-icons/fa";
import { useHistory } from "react-router-dom";

import { randomChartName, titleToLocalStorageKey } from "../lib/helpers";
import { docToString, useDoc } from "../lib/useDoc";

export function CloneButton() {
  const { push } = useHistory();
  const fullText = useDoc((s) => docToString(s));
  return (
    <button
      className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 flex items-center gap-2"
      onClick={() => {
        const newChartTitle = randomChartName();
        window.localStorage.setItem(
          titleToLocalStorageKey(newChartTitle),
          fullText ?? ""
        );
        push(`/${newChartTitle}`);
      }}
    >
      <FaCopy size={20} />
      <span className="text-lg">
        <Trans>Clone</Trans>
      </span>
    </button>
  );
}
