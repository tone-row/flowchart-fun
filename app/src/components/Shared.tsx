import "@reach/dialog/styles.css";
import "@reach/tooltip/styles.css";

import { Trans } from "@lingui/macro";
import ReachDialog, { DialogProps } from "@reach/dialog";
import type * as Polymorphic from "@reach/utils/polymorphic";
import VisuallyHidden from "@reach/visually-hidden";
import { HandWaving, Warning, X } from "phosphor-react";
import { forwardRef, ReactNode } from "react";

import { Box, BoxProps } from "../slang";
import styles from "./Shared.module.css";
import Spinner from "./Spinner";

export const smallBtnTypeSize = -1;
export const tooltipSize = -2;
export const smallIconSize = 18;

export const Section = ({ as = "section", children, ...props }: BoxProps) => {
  return (
    <Box gap={2} at={{ tablet: { gap: 4 } }} as={as} {...props}>
      {children}
    </Box>
  );
};
export const Page = ({ as = "div", children, ...props }: BoxProps) => {
  return (
    <Box as={as} gap={6} at={{ tablet: { gap: 10 } }} {...props}>
      {children}
    </Box>
  );
};

type InputProps = { isLoading?: boolean } & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ isLoading, className = "", ...props }, ref) => {
    return (
      <Box p={2} px={3} rad={1} className={[styles.Input, className].join(" ")}>
        <input
          autoComplete="off"
          type="text"
          ref={ref}
          className={`${styles.InputText} text-xs`}
          {...props}
        />
        {isLoading && (
          <Spinner
            className={styles.InputSpinner}
            r={8}
            s={2}
            c="var(--color-uiAccent)"
          />
        )}
      </Box>
    );
  }
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  { box?: BoxProps } & React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >
>(({ box = {}, ...props }, ref) => {
  const { as = "div", ...boxProps } = box;
  return (
    <Box
      p={3}
      rad={1}
      as={as}
      className={[styles.Input, boxProps.className ?? ""].join(" ")}
      {...boxProps}
    >
      <textarea autoComplete="off" ref={ref} className="text-sm" {...props} />
    </Box>
  );
});
Textarea.displayName = "Textarea";

export const Button = forwardRef<
  HTMLButtonElement,
  BoxProps & { text?: string; typeClasses?: string }
>(function Button(
  {
    children,
    as = "button",
    onClick,
    className = "",
    text,
    typeClasses = "",
    ...props
  },
  ref
) {
  return (
    <Box
      as={as}
      className={[styles.Button, className].join(" ")}
      rad={1}
      onClick={onClick}
      content="center"
      {...props}
      ref={ref}
    >
      {text ? (
        <span className={`${styles.ButtonType} ${typeClasses}`}>{text}</span>
      ) : (
        children
      )}
    </Box>
  );
});

export const Dialog = ({
  dialogProps,
  children,
  innerBoxProps: { as = "div", ...props },
}: {
  dialogProps: Parameters<
    Polymorphic.ForwardRefComponent<"div", DialogProps>
  >[0] &
    BoxProps;
  children: ReactNode;
  innerBoxProps: BoxProps;
}) => {
  const { className = "", ...rest } = dialogProps;
  return (
    <Box
      as={ReachDialog}
      p={2}
      rad={2}
      className={`${className} ${styles.Dialog}`}
      {...rest}
    >
      <Box gap={0}>
        <Box
          as="button"
          className={styles.CloseButton}
          onClick={dialogProps.onDismiss}
          self="normal end"
        >
          <VisuallyHidden>
            <Trans>Close</Trans>
          </VisuallyHidden>
          <X size={28} aria-hidden />
        </Box>
        <Box
          as={as}
          p={5}
          rad={1}
          background="color-background"
          className={styles.InnerDialog}
          {...props}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export { default as Tooltip } from "@reach/tooltip";

type NoticeStyle = "warning" | "info";
export function Notice({
  children,
  style = "warning",
  boxProps = {},
}: {
  children: ReactNode;
  style?: NoticeStyle;
  boxProps?: BoxProps;
}) {
  const Icon = style === "warning" ? Warning : HandWaving;
  const { as = "div", ...rest } = boxProps;
  return (
    <Box
      data-style={style}
      p={2}
      px={3}
      pr={4}
      rad={1}
      self="normal start"
      flow="column"
      content="start"
      items="center stretch"
      gap={2}
      className={styles.CancelNotice}
      color="palette-black-0"
      as={as}
      {...rest}
    >
      <Icon size={smallIconSize} />
      <span className="text-sm">{children}</span>
    </Box>
  );
}
