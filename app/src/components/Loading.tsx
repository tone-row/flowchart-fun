import { Box, BoxProps } from "../slang";
import Spinner from "./Spinner";

export default function Loading({ as = "div", props }: BoxProps) {
  return (
    <Box
      background="color-background"
      as={as}
      content="center"
      root
      style={{ width: "100%" }}
      {...props}
    >
      <Spinner />
    </Box>
  );
}
