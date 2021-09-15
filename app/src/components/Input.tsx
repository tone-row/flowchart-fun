import { forwardRef } from "react";
import { Box, Type, TypeProps } from "../slang";
import styles from "./Input.module.css";

export const Input = forwardRef<HTMLInputElement, TypeProps>((props, ref) => {
  return (
    <Box p={3} className={styles.Input}>
      <Type as="input" autoComplete="off" type="text" ref={ref} {...props} />
    </Box>
  );
});
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TypeProps>(
  (props, ref) => {
    return (
      <Box p={3} className={styles.Input}>
        <Type
          as="textarea"
          autoComplete="off"
          type="text"
          ref={ref}
          {...props}
        />
      </Box>
    );
  }
);
Textarea.displayName = "Textarea";
