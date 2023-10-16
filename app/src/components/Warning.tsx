import { ReactNode } from "react";

export function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="bg-orange-200 border-orange-400 border-l-4 p-4 rounded text-sm text-neutral-900 leading-normal">
      {children}
    </div>
  );
}
