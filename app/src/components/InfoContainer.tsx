import "../pages/post/Post.css";

import { CSSProperties, ReactNode } from "react";

import { Box } from "../slang";

export function InfoContainer({
  children,
  style = {},
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <Box
      px={6}
      pt={16}
      pb={10}
      style={{
        maxWidth: 760,
        marginInline: "auto",
        position: "relative",
        width: "100%",
        ...style,
      }}
      content="start normal"
    >
      {children}
    </Box>
  );
}
