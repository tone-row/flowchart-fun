import { ReactNode } from "react";

import { useIsProUser } from "../lib/hooks";
import { ImportDataDialog } from "./ImportDataDialog";
import { ImportDataUnauthenticatedDialog } from "./ImportDataUnauthenticatedDialog";
import { LearnSyntaxDialog } from "./LearnSyntaxDialog";
import { LoadTemplateDialog } from "./LoadTemplateDialog";
import { LoadFileButton } from "./LoadFileButton";
import { useLocation } from "react-router-dom";

export function EditorOptions({ children }: { children: ReactNode }) {
  const isProUser = useIsProUser();
  const isSandbox = useLocation().pathname === "/";
  return (
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)]">
      <div className="pl-5 py-2 pr-2 flex gap-2 items-center bg-gradient-to-b from-blue-50 to-white dark:bg-none">
        <div className="flex justify-start w-full gap-4 items-center">
          <LoadTemplateDialog />
          <LearnSyntaxDialog />
          {isSandbox ? <LoadFileButton /> : null}
          {isProUser ? (
            <ImportDataDialog />
          ) : (
            <ImportDataUnauthenticatedDialog />
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
