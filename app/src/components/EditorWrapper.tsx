import { Trans } from "@lingui/macro";
import { Suspense, useContext } from "react";

import { useIsLoggedIn, useIsProUser, useIsReadOnly } from "../lib/hooks";
import { docToString, useDoc, useDocDetails } from "../lib/useDoc";
import { Button2, Input } from "../ui/Shared";
import { SectionTitle } from "../ui/Typography";
import { AppContext } from "./AppContext";
import { CloneButton } from "./CloneButton";
import styles from "./EditorWrapper.module.css";
import Loading from "./Loading";
import { RenameButton } from "./RenameButton";
import ShareDialog from "./ShareDialog";
import { FloppyDisk, Share } from "phosphor-react";
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

/**
 * Adds title and export button to the editor
 */
export function EditorWrapper({ children }: { children: React.ReactNode }) {
  const title = useDocDetails("title", "flowchart.fun");
  const { setShareModal } = useContext(AppContext);
  const isReadOnly = useIsReadOnly();
  const isPro = useIsProUser();
  const pageTitle = title || "flowchart.fun";
  const isSandbox = useLocation().pathname === "/";

  return (
    <div className={styles.EditorWrapper}>
      <header
        className={classNames(
          styles.HeaderTitle,
          "flex items-center gap-2 justify-between pl-6 pr-2 pt-2"
        )}
      >
        {isSandbox ? (
          <FlowchartTitle title={title} className="-translate-y-[2px]">
            {pageTitle}
          </FlowchartTitle>
        ) : (
          <RenameButton key={pageTitle}>
            <FlowchartTitle title={title} className="-translate-y-[2px]">
              {pageTitle}
            </FlowchartTitle>
          </RenameButton>
        )}
        <div className="flex items-center gap-2">
          {isReadOnly && (
            <span className="text-xs text-neutral-400 dark:text-neutral-600 font-extrabold uppercase tracking-tight">
              <Trans>Read-only</Trans>
            </span>
          )}
          {isReadOnly && isPro ? <CloneButton /> : null}
          {!isReadOnly ? (
            <>
              {isSandbox ? <SaveButton /> : null}
              <ShareDialog>
                <Button2
                  color="blue"
                  onClick={() => setShareModal(true)}
                  leftIcon={<Share className="w-4 h-4" />}
                  aria-label="Export"
                >
                  <Trans>Share</Trans>
                </Button2>
              </ShareDialog>
            </>
          ) : null}
        </div>
      </header>
      <Suspense fallback={<Loading />}>
        <main>{children}</main>
      </Suspense>
    </div>
  );
}

function SaveButton() {
  const isLoggedIn = useIsLoggedIn();
  const isPro = useIsProUser();
  return isLoggedIn ? (
    isPro ? (
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
      color="zinc"
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
      color="purple"
      leftIcon={<FloppyDisk className="w-4 h-4" />}
      onClick={() => {
        showPaywall({
          title: createUnlimitedTitle(),
          content: createUnlimitedContent(),
        });
      }}
    >
      <Trans>Save</Trans>
    </Button2>
  );
}
function CanSaveButton() {
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
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button2 color="purple" leftIcon={<FloppyDisk className="w-4 h-4" />}>
          Save
        </Button2>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Overlay />
        <Content>
          <Dialog.Title className="mb-4">
            <SectionTitle isUnderline={false}>
              <Trans>Save</Trans>
            </SectionTitle>
          </Dialog.Title>
          <Dialog.Description>
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
                <span>Title</span>
                <Input
                  name="title"
                  id="title"
                  required
                  disabled={createChartMutation.isLoading}
                />
              </label>
              <Button2
                color="purple"
                leftIcon={<FloppyDisk className="w-4 h-4" />}
                isLoading={createChartMutation.isLoading}
              >
                Save
              </Button2>
            </form>
          </Dialog.Description>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function FlowchartTitle({
  children,
  className = "",
  ...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={classNames("text-xl md:text-2xl font-extrabold", className)}
      {...props}
    >
      {children}
    </h1>
  );
}
