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
      <div className="pl-5 py-3 flex gap-2 items-center bg-blue-50 dark:bg-blue-900/30">
        <div className="flex content-start gap-4 items-center">
          <LoadTemplateDialog />
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
