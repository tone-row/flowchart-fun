import "./Dialog.css";

import * as Dialog from "@radix-ui/react-dialog";
import { forwardRef } from "react";

export const Overlay = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    {...props}
    className={`bg-foreground/50 dark:bg-background/50 data-[state=open]:animate-overlayShow fixed inset-0 ${className}`}
  />
));
Overlay.displayName = "Dialog.Overlay";

export const Content = forwardRef<
  HTMLDivElement,
  { maxWidthClass?: string } & React.HTMLAttributes<HTMLDivElement>
>(({ maxWidthClass = "max-w-[400px]", className = "", ...props }, ref) => (
  <Dialog.Content
    ref={ref}
    {...props}
    className={`dialog-content data-[state=open]:animate-contentShow bg-background text-foreground dark:bg-foreground dark:text-background fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] ${maxWidthClass} translate-x-[-50%] translate-y-[-50%] rounded-lg bg-background p-4 shadow-lg focus:outline-none z-50 grid gap-3 ${className}`}
  />
));
Content.displayName = "Dialog.Content";

{
  /* <Dialog.Content className="data-[state=open]:animate-contentShow bg-background text-foreground dark:bg-foreground dark:text-background fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[400px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-background p-4 shadow-lg focus:outline-none z-50 grid gap-3"></Dialog.Content> */
}
