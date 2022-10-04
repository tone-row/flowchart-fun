import { decompressFromEncodedURIComponent as decompress } from "lz-string";
import { useState } from "react";
import { useParams, useRouteMatch } from "react-router-dom";

import { useParseDoc } from "./useParseDoc";

export function useReadOnlyDoc() {
  const { path } = useRouteMatch();
  const isCompressed = [
    "/c/:graphText?",
    "/f/:graphText?",
    "/n/:graphText?",
  ].includes(path);
  const { graphText = window.location.hash.slice(1) } = useParams<{
    graphText: string;
  }>();
  const initialText = isCompressed
    ? decompress(graphText) ?? ""
    : decodeURIComponent(graphText);

  // immediate, full state
  const [fullText, setFullText] = useState(initialText || "");

  const parsedDoc = useParseDoc(fullText, setFullText, false);

  return {
    fullText,
    ...parsedDoc,
  };
}
