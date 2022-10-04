import { useState } from "react";

import { useParseDoc } from "./parseDoc";
import { usePublicChart } from "./queries";

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
