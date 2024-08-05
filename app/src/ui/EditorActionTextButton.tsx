import classNames from "classnames";
import { BracketsAngle } from "phosphor-react";
import { forwardRef, ReactNode } from "react";
import { IconType } from "react-icons/lib";

/**
 * A button that can be used to open the syntax reference.
 * or other things above the text editor.
 */
export const EditorActionTextButton = forwardRef<
  HTMLButtonElement,
  {
    icon: typeof BracketsAngle | IconType;
    children: ReactNode;
    iconClassName?: string;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(function EditorActionTextButton(
  { icon: Icon, children, iconClassName = "", className = "", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`px-2 py-1.5 text-left font-bold text-[14px] text-foreground/50 rounded-md flex items-center gap-2 hover:bg-white dark:hover:bg-white/10 dark:hover:text-white hover:text-foreground focus:shadow-none dark:text-white dark:active:text-green-200 ${className}`}
      {...props}
    >
      <Icon
        size={20}
        className={classNames("hidden lg:block", iconClassName)}
      />
      {children}
    </button>
  );
});
