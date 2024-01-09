import { useEffect, useState } from "react";

import { useIsProUser } from "../lib/hooks";
import { ImportDataDialog } from "./ImportDataDialog";
import { ImportDataUnauthenticatedDialog } from "./ImportDataUnauthenticatedDialog";
import { LearnSyntaxDialog } from "./LearnSyntaxDialog";
import { LoadTemplateDialog } from "./LoadTemplateDialog";
import { LoadFileButton } from "./LoadFileButton";
import { useLocation } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Sliders } from "phosphor-react";

export function Actions() {
  const isProUser = useIsProUser();
  const isSandbox = useLocation().pathname === "/";
  const [open, setOpen] = useState(false);
  useEffect(() => {
    // when open, bind a listener to the window that catches clicks which bubble up from the editor-options dropdown
    if (!open) return;
    const listener = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("#editor-options")) {
        // debugger;
        // setOpen(false);
      }
    };

    window.addEventListener("click", listener);

    return () => {
      window.removeEventListener("click", listener);
    };
  }, [setOpen, open]);
  return (
    <>
      <div className="hidden md:flex justify-start w-full gap-x-2 items-center whitespace-nowrap flex-wrap py-2">
        <LoadTemplateDialog />
        <LearnSyntaxDialog />
        {isSandbox ? <LoadFileButton /> : null}
        {isProUser ? <ImportDataDialog /> : <ImportDataUnauthenticatedDialog />}
      </div>
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <button className="md:hidden mr-1 rounded flex self-center items-center justify-center w-8 h-8 bg-neutral-300 hover:bg-neutral-400 focus:outline-none">
            <Sliders size={24} />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          align="end"
          className="min-w-[220px] bg-white rounded-md shadow-xl select-none p-2"
          id="editor-options"
        >
          <LoadTemplateDialog />
          <LearnSyntaxDialog />
          {isSandbox ? <LoadFileButton /> : null}
          {isProUser ? (
            <ImportDataDialog />
          ) : (
            <ImportDataUnauthenticatedDialog />
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </>
  );
}
