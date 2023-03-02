import { Trans } from "@lingui/macro";
import { FaCopy } from "react-icons/fa";
import { useHistory } from "react-router-dom";

import { getDoc } from "../lib/docHelpers";
import { docToString } from "../lib/docToString";
import { randomChartName, titleToLocalStorageKey } from "../lib/helpers";
import { Type } from "../slang";
import styles from "./EditorWrapper.module.css";

export function CloneButton() {
  const { push } = useHistory();
  const fullText = docToString(getDoc());
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
