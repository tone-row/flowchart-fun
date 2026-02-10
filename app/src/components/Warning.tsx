import { ReactNode } from "react";

export function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="bg-blue-50 border-blue-200 border-l-4 p-4 rounded text-sm text-blue-900 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200 leading-normal">
      {children}
    </div>
  );
}
