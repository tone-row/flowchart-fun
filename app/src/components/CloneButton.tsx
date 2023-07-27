import { Trans } from "@lingui/macro";
import { CopySimple } from "phosphor-react";
import { useNavigate } from "react-router-dom";

import { slugify, titleToLocalStorageKey } from "../lib/helpers";
import { docToString, useDoc } from "../lib/useDoc";
import { Button2 } from "../ui/Shared";
import { useContext, useState } from "react";
import { AppContext } from "./AppContext";
import { getFunFlowchartName } from "../lib/getFunFlowchartName";
import { languages } from "../locales/i18n";

export function CloneButton() {
  const navigate = useNavigate();
  const fullText = useDoc((s) => docToString(s));
  const language = useContext(AppContext).language;
  const [name] = useState<string>(
    slugify(getFunFlowchartName(language as keyof typeof languages))
  );
  return (
    <Button2
      color="blue"
      onClick={() => {
        window.localStorage.setItem(
          titleToLocalStorageKey(name),
          fullText ?? ""
        );
        navigate(`/${name}`);
      }}
      rightIcon={<CopySimple size={16} />}
    >
      <Trans>Clone</Trans>
    </Button2>
  );
}
