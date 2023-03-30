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
      className={`text-sm text-blue-500 flex items-center gap-1 hover:text-blue-600 active:text-blue-800 focus:shadow-none ${className}`}
      {...props}
    >
      <Icon size={16} weight="regular" />
      {children}
    </button>
  );
});
