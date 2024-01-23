import "./Dialog.css";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "phosphor-react";
import { forwardRef } from "react";

import { focusClasses } from "./Shared";
import { globalZ } from "../lib/globalZ";

export const Overlay = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    {...props}
    className={`bg-foreground/50 dark:bg-background/50 data-[state=open]:animate-overlayShow z-[40] fixed inset-0 ${className}`}
  />
));
Overlay.displayName = "Dialog.Overlay";

export const Content = forwardRef<
  HTMLDivElement,
  {
    maxWidthClass?: string;
    overflowV?: boolean;
    noPadding?: boolean;
  } & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      maxWidthClass = "max-w-[400px]",
      className = "",
      overflowV = false,
      noPadding = false,
      ...props
    },
    ref
  ) => (
    <Dialog.Content
      ref={ref}
      {...props}
      className={`${
        overflowV ? "dialog-content-v-overflow overflow-auto " : ""
      }data-[state=open]:animate-contentShow bg-background text-foreground dark:bg-foreground dark:text-background fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] ${maxWidthClass} translate-x-[-50%] translate-y-[-50%] rounded-lg bg-background shadow-lg focus:outline-none ${
        globalZ.defaultDialog
      } ${noPadding ? "" : "p-4 grid gap-3"} ${className}`}
    />
  )
);

Content.displayName = "Dialog.Content";

export const Close = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ className = "", ...props }, ref) => (
  <Dialog.Close
    ref={ref}
    {...props}
    className={`absolute top-1 right-1 p-2 rounded-md focus:outline-none ${focusClasses}
    ${className}`}
    data-testid="close-button"
  >
    <X size={16} />
  </Dialog.Close>
));

Close.displayName = "Close";
