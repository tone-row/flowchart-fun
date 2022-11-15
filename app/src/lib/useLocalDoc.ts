import { useParams } from "react-router-dom";
import useLocalStorage from "react-use-localstorage";

import { useDefaultDoc } from "./useDefaultDoc";
import { useParseDoc } from "./useParseDoc";

export function useLocalDoc(defaultWorkspace = "") {
  const { workspace = defaultWorkspace } = useParams<{ workspace?: string }>();
  const defaultText = useDefaultDoc();
  const [fullText, setFullText] = useLocalStorage(
    ["flowcharts.fun", workspace].filter(Boolean).join(":"),
    defaultText
  );
  const parsedDoc = useParseDoc(fullText, setFullText, true);

  return {
    fullText,
    ...parsedDoc,
  };
}
