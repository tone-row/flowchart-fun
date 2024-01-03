import { ReactNode } from "react";

import { useIsProUser } from "../lib/hooks";
import { ImportDataDialog } from "./ImportDataDialog";
import { ImportDataUnauthenticatedDialog } from "./ImportDataUnauthenticatedDialog";
import { LearnSyntaxDialog } from "./LearnSyntaxDialog";
import { LoadTemplateDialog } from "./LoadTemplateDialog";
import { LoadFileButton } from "./LoadFileButton";
import { useLocation } from "react-router-dom";

export function EditorOptions({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)]">
      <EditorOptionsInner />
      {children}
    </div>
  );
}

export function EditorOptionsInner() {
  const isProUser = useIsProUser();
  const isSandbox = useLocation().pathname === "/";
  return (
    <div className="py-2 flex gap-2 items-center">
      <div className="flex justify-start w-full gap-x-2 items-center whitespace-nowrap flex-wrap">
        <LoadTemplateDialog />
        <LearnSyntaxDialog />
        {isSandbox ? <LoadFileButton /> : null}
        {isProUser ? <ImportDataDialog /> : <ImportDataUnauthenticatedDialog />}
      </div>
    </div>
  );
}
