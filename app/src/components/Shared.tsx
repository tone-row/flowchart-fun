import { forwardRef } from "react";
import { Box, BoxProps, Type, TypeProps } from "../slang";
import styles from "./Shared.module.css";

export const SectionTitle = ({ children, as = "h2", ...props }: TypeProps) => {
  return (
    <Type as={as} weight="400" size={1} {...props}>
      {children}
    </Type>
  );
};

export const Section = ({ as = "section", children, ...props }: BoxProps) => {
  return (
    <Box gap={2} at={{ tablet: { gap: 5 } }} as={as} {...props}>
      {children}
    </Box>
  );
};
export const Page = ({ as = "div", children, ...props }: BoxProps) => {
  return (
    <Box as={as} gap={10} at={{ tablet: { gap: 14 } }} {...props}>
      {children}
    </Box>
  );
};

export const Input = forwardRef<HTMLInputElement, TypeProps>((props, ref) => {
  return (
    <Box p={3} rad={1} className={styles.Input}>
      <Type
        as="input"
        autoComplete="off"
        type="text"
        size={-1}
        ref={ref}
        {...props}
      />
    </Box>
  );
});
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TypeProps>(
  (props, ref) => {
    return (
      <Box p={3} rad={1} className={styles.Input}>
        <Type
          as="textarea"
          autoComplete="off"
          type="text"
          ref={ref}
          size={-1}
          {...props}
        />
      </Box>
    );
  }
);
Textarea.displayName = "Textarea";

export function Button({
  children,
  as = "button",
  onClick,
  className = "",
  ...props
}: BoxProps) {
  return (
    <Box
      p={3}
      as={as}
      className={[styles.Button, className].join(" ")}
      rad={1}
      onClick={onClick}
      content="center"
      {...props}
    >
      <Type className={styles.ButtonType} as="span" size={-1}>
        {children}
      </Type>
    </Box>
  );
}
