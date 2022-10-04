import { useState } from "react";

import { usePublicChart } from "./queries";
import { useParseDoc } from "./useParseDoc";

export function usePublicDoc(publicId?: string) {
  const { data } = usePublicChart(publicId);

  // immediate, full state
  const [fullText, setFullText] = useState(data?.chart || "");

  const parsedDoc = useParseDoc(fullText, setFullText, false);

  return {
    fullText,
    ...parsedDoc,
  };
}
