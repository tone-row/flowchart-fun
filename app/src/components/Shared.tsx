import { forwardRef, ReactNode } from "react";
import { Box, BoxProps, Type, TypeProps } from "../slang";
import "@reach/dialog/styles.css";
import ReachDialog, { DialogProps } from "@reach/dialog";
import VisuallyHidden from "@reach/visually-hidden";
import styles from "./Shared.module.css";
import { Trans } from "@lingui/macro";
import { X } from "phosphor-react";
import "@reach/tooltip/styles.css";

export const smallBtnTypeSize = -1;
export const smallIconSize = 18;

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
    <Box as={as} gap={6} at={{ tablet: { gap: 14 } }} {...props}>
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

export const Dialog = ({
  dialogProps,
  children,
  innerBoxProps: { as = "div", ...props },
}: {
  dialogProps: DialogProps;
  children: ReactNode;
  innerBoxProps: BoxProps;
}) => {
  return (
    <Box
      as={ReachDialog}
      p={2}
      rad={2}
      background="color-input"
      {...dialogProps}
    >
      <Box gap={1}>
        <Box
          as="button"
          className={styles.CloseButton}
          onClick={dialogProps.onDismiss}
          self="normal end"
        >
          <VisuallyHidden>
            <Trans>Close</Trans>
          </VisuallyHidden>
          <X width={33} height={33} aria-hidden />
        </Box>
        <Box
          as={as}
          p={5}
          rad={1}
          background="color-background"
          className={styles.InnerDialog}
          at={{ tablet: { p: 10 } }}
          {...props}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export { default as Tooltip } from "@reach/tooltip";
export type { TooltipProps } from "@reach/tooltip";
