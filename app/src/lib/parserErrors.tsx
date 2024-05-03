import { t, Trans } from "@lingui/macro";
import { ReactNode } from "react";

export type ParserErrorCode =
  | "EDGE_LABEL_WITHOUT_PARENT"
  | "MULTIPLE_POINTERS_ON_SAME_LINE"
  | "POINTER_AND_CONTAINER_ON_SAME_LINE"
  | "NODE_AND_POINTER_ON_SAME_LINE"
  | "DUPLICATE_NODE_ID"
  | "DUPLICATE_EDGE_ID";

export function getParserError(code: ParserErrorCode): {
  message: ReactNode;
  resolution?: ReactNode;
} {
  switch (code) {
    case "EDGE_LABEL_WITHOUT_PARENT":
      return {
        message: t`Edge missing indentation`,
        resolution: (
          <Trans>
            If you mean to create an edge, indent this line. If not, escape the
            colon with a backslash <code>\:</code>
          </Trans>
        ),
      };
    case "MULTIPLE_POINTERS_ON_SAME_LINE":
      return {
        message: t`Multiple pointers on same line`,
        resolution: t`To fix this move one pointer to the next line`,
      };
    case "POINTER_AND_CONTAINER_ON_SAME_LINE":
      return {
        message: t`Pointer and container on same line`,
        resolution: (
          <Trans>
            To fix this start the container{" "}
            <code dangerouslySetInnerHTML={{ __html: "&lcub;" }} /> on a
            different line
          </Trans>
        ),
      };
    case "NODE_AND_POINTER_ON_SAME_LINE":
      return {
        message: t`Unescaped special character`,
        resolution: (
          <Trans>
            Add a backslash (<code>\</code>) before any special characters:{" "}
            <code>(</code>, <code>:</code>, <code>#</code>, or <code>.</code>`
          </Trans>
        ),
      };
    case "DUPLICATE_NODE_ID":
      return {
        message: t`Two nodes have the same ID`,
        resolution: t`To fix this change one of the node IDs`,
      };
    case "DUPLICATE_EDGE_ID":
      return {
        message: t`Two edges have the same ID`,
        resolution: t`To fix this change one of the edge IDs`,
      };
    default:
      return {
        message: t`Unknown Parsing Error`,
      };
  }
}
