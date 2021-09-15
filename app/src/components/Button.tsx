import { ReactNode } from "react";
import { BoxProps, Box, Type } from "../slang";
import styles from "./Button.module.css";

export function Button({
  children,
  ...props
}: { children: ReactNode } & BoxProps) {
  return (
    <Box as="button" className={styles.Button} p={3} px={6} {...props}>
      <Type as="span">{children}</Type>
    </Box>
  );
}
