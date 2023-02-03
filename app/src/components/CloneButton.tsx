import { Trans } from "@lingui/macro";
import { FaCopy } from "react-icons/fa";
import { useHistory } from "react-router-dom";

import { randomChartName, titleToLocalStorageKey } from "../lib/helpers";
import { docToString, useDoc } from "../lib/useDoc";
import { Type } from "../slang";
import styles from "./EditorWrapper.module.css";

export function CloneButton() {
  const { push } = useHistory();
  const fullText = useDoc((s) => docToString(s));
  return (
    <button
      className={`${styles.ShareButton} ${styles.cloneBtn}`}
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
      <Type as="span">
        <Trans>Clone</Trans>
      </Type>
    </button>
  );
}
