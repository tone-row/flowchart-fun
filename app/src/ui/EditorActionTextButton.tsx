import { BracketsAngle } from "phosphor-react";
import { forwardRef, ReactNode } from "react";

/**
 * A button that can be used to open the syntax reference.
 * or other things above the text editor.
 */
export const EditorActionTextButton = forwardRef<
  HTMLButtonElement,
  {
    icon: typeof BracketsAngle;
    children: ReactNode;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(function EditorActionTextButton(
  { icon: Icon, children, className = "", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`p-1 text-[14px] font-bold text-blue-500 flex items-center gap-1 hover:text-blue-700 active:text-blue-800 focus:shadow-none dark:text-green-300 dark:hover:text-green-200 dark:active:text-green-200 ${className}`}
      {...props}
    >
      <Icon size={18} className="hidden lg:block" />
      {children}
    </button>
  );
});
