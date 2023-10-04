import { ReactNode } from "react";

import { useIsProUser } from "../lib/hooks";
import { ImportDataDialog } from "./ImportDataDialog";
import { ImportDataUnauthenticatedDialog } from "./ImportDataUnauthenticatedDialog";
import { LearnSyntaxDialog } from "./LearnSyntaxDialog";
import { LoadTemplateDialog } from "./LoadTemplateDialog";

export function EditorOptions({ children }: { children: ReactNode }) {
  const isProUser = useIsProUser();

  return (
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)]">
      <div className="pl-5 p-2 flex gap-2 items-center border-b bg-blue-50 dark:bg-blue-900/30 dark:border-b-neutral-600">
        <div className="flex content-start gap-4 items-center">
          <LoadTemplateDialog />
          {/* <span className="bg-blue-300 h-4 w-px dark:bg-blue-900" /> */}
          {isProUser ? (
            <ImportDataDialog />
          ) : (
            <ImportDataUnauthenticatedDialog />
          )}
          <LearnSyntaxDialog />
        </div>
      </div>
      {children}
    </div>
  );
}
