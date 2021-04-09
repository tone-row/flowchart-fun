import React from "react";
import { Box } from "../slang";
import Spinner from "./Spinner";

export default function Loading() {
  return (
    <Box background="color-background" content="center" root>
      <Spinner />
    </Box>
  );
}
