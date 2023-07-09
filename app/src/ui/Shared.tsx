import "@reach/dialog/styles.css";
import "@reach/tooltip/styles.css";

import { Trans } from "@lingui/macro";
import ReachDialog, { DialogProps } from "@reach/dialog";
import type * as Polymorphic from "@reach/utils/polymorphic";
import VisuallyHidden from "@reach/visually-hidden";
import { HandWaving, Warning, X } from "phosphor-react";
import { forwardRef, ReactNode } from "react";

import Spinner from "../components/Spinner";
import { Box, BoxProps } from "../slang";
import styles from "./Shared.module.css";

export const smallBtnTypeSize = -1;
export const tooltipSize = -2;
export const smallIconSize = 18;

export const Section = ({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) => {
  return <section className={`grid gap-4 ${className}`}>{children}</section>;
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

const button2Classes =
  "group relative rounded-md active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed";
const button2Colors = {
  default:
    "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:hover:bg-neutral-200 disabled:hover:text-neutral-700",
  blue: "bg-blue-500 text-white hover:bg-blue-600 disabled:hover:bg-blue-500 disabled:hover:text-white",
  orange:
    "bg-orange-500 text-white hover:bg-orange-600 disabled:hover:bg-orange-500 disabled:hover:text-white",
  green:
    "bg-green-500 text-white hover:bg-green-600 disabled:hover:bg-green-500 disabled:hover:text-white",
  purple:
    "bg-purple-500 text-white hover:bg-purple-600 disabled:hover:bg-purple-500 disabled:hover:text-white",
  zinc: "bg-zinc-500 text-white hover:bg-zinc-600 disabled:hover:bg-zinc-500 disabled:hover:text-white",
  inverted:
    "text-neutral-200 dark:text-neutral-900 bg-neutral-800 dark:bg-neutral-300 hover:bg-neutral-700 dark:hover:bg-neutral-400 disabled:hover:bg-neutral-800 disabled:hover:text-neutral-200",
  red: "bg-red-500 text-white hover:bg-red-600 disabled:hover:bg-red-500 disabled:hover:text-white",
};

const pSize = {
  xs: "p-2 text-[12px]",
  sm: "p-3 text-xs",
  md: "p-4 text-sm",
  lg: "p-5 text-base",
};

const pxButtonSize = {
  xs: (left: boolean, right: boolean) =>
    `${left ? "pl-2" : "pl-3"} ${right ? "pr-2" : "pr-3"}`,
  sm: (left: boolean, right: boolean) =>
    `${left ? "pl-4" : "pl-5"} ${right ? "pr-4" : "pr-5"}`, // only the default size has a min-width
  md: (left: boolean, right: boolean) =>
    `${left ? "pl-5" : "pl-6"} ${right ? "pr-5" : "pr-6"}`,
  lg: (left: boolean, right: boolean) =>
    `${left ? "pl-6" : "pl-7"} ${right ? "pr-6" : "pr-7"}`,
};

export const Button2 = forwardRef<
  HTMLButtonElement,
  {
    children?: ReactNode;
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    color?: keyof typeof button2Colors;
    size?: keyof typeof pSize;
  } & React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
>(
  (
    {
      children,
      color = "default",
      size = "sm",
      leftIcon,
      rightIcon,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={`flex items-center justify-center gap-3 ${button2Classes} ${pxButtonSize[
          size
        ](!!leftIcon, !!rightIcon)} ${button2Colors[color]}
      ${pSize[size]} ${className}
      `}
        {...props}
        disabled={props.disabled || props.isLoading}
        data-is-loading={props.isLoading}
        ref={ref}
      >
        {leftIcon && (
          <span className="group-data-[is-loading=true]:opacity-0">
            {leftIcon}
          </span>
        )}
        <span className="group-data-[is-loading=true]:opacity-0">
          {children}
        </span>{" "}
        {rightIcon && (
          <span className="group-data-[is-loading=true]:opacity-0">
            {rightIcon}
          </span>
        )}
        {props.isLoading && (
          <Spinner
            r={8}
            s={2}
            className="fill-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ml-[0]"
          />
        )}
      </button>
    );
  }
);

Button2.displayName = "Button2";

export const IconButton2 = forwardRef<
  HTMLButtonElement,
  {
    children?: ReactNode;
    isLoading?: boolean;
    color?: keyof typeof button2Colors;
    size?: keyof typeof pSize;
  } & React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
>(({ children, color = "default", size = "sm", ...props }, ref) => {
  return (
    <button
      className={`${pSize[size]} ${button2Classes} ${button2Colors[color]}`}
      {...props}
      disabled={props.disabled || props.isLoading}
      data-is-loading={props.isLoading}
      ref={ref}
    >
      <span className="group-data-[is-loading=true]:opacity-0">{children}</span>
      {props.isLoading && (
        <Spinner
          r={8}
          s={2}
          className="fill-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ml-[0]"
        />
      )}
    </button>
  );
});

IconButton2.displayName = "IconButton2";
