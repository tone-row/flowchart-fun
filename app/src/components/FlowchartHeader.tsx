import { Trans } from "@lingui/macro";
import { useContext, useEffect, useRef, useState } from "react";
import { useHasProAccess, useIsLoggedIn, useIsReadOnly } from "../lib/hooks";
import { docToString, useDoc, useDocDetails } from "../lib/useDoc";
import { Button2, Input } from "../ui/Shared";
import { AppContext } from "./AppContextProvider";
import { CloneButton } from "./CloneButton";
import styles from "./FlowchartHeader.module.css";
import { RenameButton } from "./RenameButton";
import ShareDialog from "./ShareDialog";
import { Cloud, FloppyDisk, File, Share, DownloadSimple } from "phosphor-react";
import classNames from "classnames";
import { useLocation, useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { Content, Overlay } from "../ui/Dialog";
import { showPaywall } from "../lib/usePaywallModalStore";
import {
  createUnlimitedContent,
  createUnlimitedTitle,
} from "../lib/paywallCopy";
import { useMutation } from "react-query";
import { makeChart } from "../lib/queries";
import { saveAs } from "file-saver";
import { DownloadDropdown } from "./DownloadDropdown";

export function FlowchartHeader() {
  const title = useDocDetails("title", "flowchart.fun");
  const { setShareModal } = useContext(AppContext);
  const isReadOnly = useIsReadOnly();
  const hasProAccess = useHasProAccess();
  const pageTitle = title || "flowchart.fun";
  const isSandbox = useLocation().pathname === "/";
  return (
    <header
      className={classNames(
        styles.HeaderTitle,
        "grid gap-2 md:flex items-end justify-between p-4 md:p-2 md:mb-2"
      )}
    >
      {isSandbox ? (
        <div className="grid gap-0.5 content-end">
          <FlowchartTitle title={title}>{pageTitle}</FlowchartTitle>
          <p className="text-xs text-neutral-500 dark:text-neutral-300/80 font-medium leading-tight text-wrap-pretty">
            <Trans>
              Create flowcharts instantly: Type or paste text, see it
              visualized.
            </Trans>
          </p>
        </div>
      ) : (
        <RenameButton key={pageTitle}>
          <FlowchartTitle title={title}>{pageTitle}</FlowchartTitle>
        </RenameButton>
      )}

      <div className="flex items-center gap-1">
        {isReadOnly && (
          <span className="text-xs text-neutral-400 dark:text-neutral-600 font-extrabold uppercase tracking-tight">
            <Trans>Read-only</Trans>
          </span>
        )}
        {isReadOnly && hasProAccess ? <CloneButton /> : null}
        {!isReadOnly ? (
          <>
            {isSandbox ? <SaveButton /> : null}
            <ShareDialog>
              <Button2
                onClick={() => setShareModal(true)}
                leftIcon={<Share weight="bold" className="w-4 h-4" />}
                aria-label="Export"
                data-session-activity="Share Chart"
              >
                <Trans>Share</Trans>
              </Button2>
            </ShareDialog>
          </>
        ) : null}
        <DownloadDropdown>
          <Button2
            leftIcon={<DownloadSimple weight="bold" className="w-4 h-4" />}
          >
            <Trans>Download</Trans>
          </Button2>
        </DownloadDropdown>
      </div>
    </header>
  );
}

function SaveButton() {
  const isLoggedIn = useIsLoggedIn();
  const hasProAccess = useHasProAccess();
  return isLoggedIn ? (
    hasProAccess ? (
      <CanSaveButton />
    ) : (
      <CannotSaveButton />
    )
  ) : (
    <LogInToSaveButton />
  );
}

function LogInToSaveButton() {
  const navigate = useNavigate();
  return (
    <Button2
      leftIcon={<FloppyDisk weight="bold" className="w-4 h-4" />}
      data-session-activity="Save Chart: Log in"
      onClick={() => {
        navigate("/l");
      }}
    >
      <Trans>Log in to Save</Trans>
    </Button2>
  );
}

function CannotSaveButton() {
  return (
    <Button2
      leftIcon={<FloppyDisk weight="bold" className="w-4 h-4" />}
      data-session-activity="Save Chart: Upgrade"
      onClick={() => {
        showPaywall({
          title: createUnlimitedTitle(),
          content: createUnlimitedContent(),
          toPricingCode: "Unlimited Charts",
        });
      }}
    >
      <Trans>Save</Trans>
    </Button2>
  );
}
function CanSaveButton() {
  const [open, setOpen] = useState(false);
  const [createType, setCreateType] = useState<"cloud" | "file" | null>(null);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        if (!open) setCreateType(null);
        setOpen(open);
      }}
    >
      <Dialog.Trigger asChild>
        <Button2
          leftIcon={<FloppyDisk weight="bold" className="w-4 h-4" />}
          data-session-activity="Save Chart"
          onClick={() => {
            setOpen(true);
          }}
        >
          <Trans>Save</Trans>
        </Button2>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Overlay />
        <Content>
          <Dialog.Description asChild>
            {createType === null ? (
              <div className="grid gap-2">
                <p className="text-center text-lg mb-2 text-wrap-balance leading-[1.3]">
                  <Trans>How would you like to save your chart?</Trans>
                </p>
                <Button2
                  leftIcon={<Cloud weight="bold" className="w-4 h-4" />}
                  data-session-activity="Save Chart: Cloud"
                  onClick={() => {
                    setCreateType("cloud");
                  }}
                >
                  <Trans>Save to Cloud</Trans>
                </Button2>
                <Button2
                  leftIcon={<File weight="bold" className="w-4 h-4" />}
                  data-session-activity="Save Chart: File"
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => {
                      saveAs(
                        new Blob([docToString(useDoc.getState())], {
                          type: "text/plain;charset=utf-8",
                        }),
                        "flowchart.fun.txt"
                      );
                    }, 100);
                  }}
                >
                  <Trans>Save to File</Trans>
                </Button2>
              </div>
            ) : (
              <SaveForm />
            )}
          </Dialog.Description>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SaveForm() {
  const { session } = useContext(AppContext);
  const userId = session?.user?.id;
  const fullText = useDoc(docToString);
  const navigate = useNavigate();
  const createChartMutation = useMutation(async (title: string) => {
    if (!userId || !title) throw new Error("Could not create hosted chart");
    const response = await makeChart({
      name: title,
      user_id: userId,
      chart: fullText,
    });
    if (!response) throw new Error("Could not create hosted chart");
    const charts = response.data;
    if (!charts) throw new Error("Could not create hosted chart");
    const chart = charts[0];
    if (!chart) throw new Error("Could not create hosted chart");
    navigate(`/u/${chart.id}`);
  });
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return (
    <form
      className="grid gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
        const title = data.get("title") as string;
        createChartMutation.mutate(title);
      }}
    >
      <label className="grid gap-2" htmlFor="title">
        <p className="text-lg text-center mb-1 text-wrap-balance leading-[1.3]">
          <Trans>Name your chart</Trans>
        </p>
        <Input
          name="title"
          id="title"
          required
          ref={inputRef}
          disabled={createChartMutation.isLoading}
        />
      </label>
      <Button2
        leftIcon={<FloppyDisk className="w-4 h-4" />}
        isLoading={createChartMutation.isLoading}
      >
        Save
      </Button2>
    </form>
  );
}

function FlowchartTitle({
  children,
  className = "",
  ...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={classNames(
        "text-lg sm:text-xl md:text-[30px] tracking-[0.5px] font-bold -translate-y-[2px]",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
}
