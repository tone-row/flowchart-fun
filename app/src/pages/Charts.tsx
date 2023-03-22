import { t, Trans } from "@lingui/macro";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Copy,
  Folder,
  FolderOpen,
  Plus,
  Sparkle,
  Trash,
  X,
} from "phosphor-react";
import { memo, ReactNode, useContext, useReducer, useState } from "react";
import { useMutation } from "react-query";
import { Link, useHistory } from "react-router-dom";

import { AppContext } from "../components/AppContext";
import { DialogButton } from "../components/DialogButton";
import Loading from "../components/Loading";
import { LOCAL_STORAGE_SETTINGS_KEY } from "../lib/constants";
import { titleToLocalStorageKey } from "../lib/helpers";
import { useIsValidCustomer } from "../lib/hooks";
import {
  copyHostedChartById,
  deleteChart,
  queryClient,
  useHostedCharts,
} from "../lib/queries";
import { useLastChart } from "../lib/useLastChart";
// Keep these in sync (65px)
const leftColumnGrid = "grid-cols-[65px_minmax(0,1fr)]";
const leftMargin = "sm:mx-[65px]";

export default function Charts() {
  const isCustomer = useIsValidCustomer();
  const customerIsLoading = useContext(AppContext).customerIsLoading;
  // write a charts reducer where the dispatch just refetches charts
  const [temporaryCharts, refetchTemporaryCharts] = useReducer(
    getTemporaryCharts,
    getTemporaryCharts()
  );
  const { data: persistentCharts, isLoading } = useHostedCharts();
  const isLoadingAnything = isLoading || customerIsLoading;
  const { push } = useHistory();
  const currentChart = useLastChart((state) => state.lastChart);
  const handleDeleteChart = useMutation("deleteChart", deleteChart, {
    onSuccess: (_result, args) => {
      queryClient.invalidateQueries(["auth", "hostedCharts"]);

      // set the root chart as the active one
      useLastChart.setState({ lastChart: "" });

      // remove the deleted chart from reactQuery
      queryClient.removeQueries(["useHostedDoc", args.chartId]);
    },
    onMutate: async (args) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(["auth", "hostedCharts"]);

      const previousHostedCharts = queryClient.getQueryData([
        "auth",
        "hostedCharts",
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["auth", "hostedCharts"], (old: any) => {
        return old.filter((chart: any) => chart.id !== args.chartId);
      });

      // Return a context object with the snapshotted value
      return { previousHostedCharts };
    },
    onError: (_err, _args, context) => {
      queryClient.setQueryData(
        ["auth", "hostedCharts"],
        context?.previousHostedCharts
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(["auth", "hostedCharts"]);
    },
  });
  const handleCopyPersistentChart = useMutation(
    "copyPersistentChart",
    copyHostedChartById,
    {
      onSuccess: (result) => {
        queryClient.invalidateQueries(["auth", "hostedCharts"]);
        if (result && result.id) push(`/u/${result.id}`);
      },
    }
  );
  return (
    <div className="px-4 py-16 max-w-3xl w-full mx-auto grid gap-16 content-start">
      <header className="flex items-center justify-center gap-6">
        <h1 className="text-4xl">
          <Trans>Your Charts</Trans>
        </h1>
        <DialogButton as={Link} to="/n" icon={Plus} color="inverted">
          <Trans>New</Trans>
        </DialogButton>
      </header>
      <section className="grid gap-12">
        <LargeFolder
          title={t`Permanent Flowcharts`}
          description={
            <Trans>
              Access these charts from anywhere.
              <br />
              Share and embed flowcharts that stay in sync.
            </Trans>
          }
        >
          {isLoadingAnything ? (
            <div className="py-4">
              <Loading />
            </div>
          ) : isCustomer ? (
            <div>
              {persistentCharts?.map((chart) => (
                <ChartLink
                  key={chart.id}
                  title={chart.name}
                  href={`/u/${chart.id}`}
                  handleDelete={() => {
                    handleDeleteChart.mutate({ chartId: chart.id });
                  }}
                  handleCopy={() => {
                    handleCopyPersistentChart.mutate(chart.id as string);
                  }}
                  isCurrent={`/u/${chart.id}` === currentChart}
                >
                  <div className="flex items-center gap-4 text-xs text-foreground/50 dark:text-background/50">
                    <span>{chart.niceCreatedDate}</span>
                    <span>{chart.niceUpdatedDate}</span>
                  </div>
                </ChartLink>
              ))}
            </div>
          ) : (
            <ProFeatureLink />
          )}
        </LargeFolder>

        <LargeFolder
          title={t`Temporary Flowcharts`}
          description={
            <Trans>
              Only available on this device.
              <br />
              Clearing your browser cache will erase them.
            </Trans>
          }
        >
          <div>
            {temporaryCharts.map((chart) => (
              <ChartLink
                key={chart}
                title={`/${chart}`}
                href={`/${chart}`}
                handleDelete={() => {
                  deleteLocalChart(chart, currentChart || "", push);
                  refetchTemporaryCharts();
                }}
                handleCopy={() => {
                  copyLocalChart(chart, push);
                }}
                isCurrent={`/${chart}` === currentChart}
              />
            ))}
          </div>
        </LargeFolder>
      </section>
    </div>
  );
}

const LargeFolder = memo(function LargeFolder({
  title,
  description = null,
  children,
}: {
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
      <section className="grid gap-4">
        <Collapsible.Trigger asChild>
          <button
            className={`grid grid-auto-cols items-center text-left w-full ${leftColumnGrid} focus:shadow-none`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FolderOpen size={45} /> : <Folder size={45} />}
            <div className="grid gap-[2px]">
              <h2 className="text-xl font-bold">{title}</h2>
              {description ? (
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {description}
                </div>
              ) : null}
            </div>
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <List>{children}</List>
        </Collapsible.Content>
      </section>
    </Collapsible.Root>
  );
});

const List = memo(function List({ children }: { children: ReactNode }) {
  return <div className={`grid gap-4 ${leftMargin}`}>{children}</div>;
});

function getTemporaryCharts() {
  return [""]
    .concat(
      Object.keys(window.localStorage)
        .filter(
          (key) =>
            key.indexOf("flowcharts.fun:") === 0 &&
            key !== LOCAL_STORAGE_SETTINGS_KEY
        )
        .map((file) => file.split(":")[1])
    )
    .sort();
}

const ChartLink = memo(function ChartLink({
  title,
  href,
  children = null,
  handleDelete,
  handleCopy,
  isCurrent = false,
}: {
  title: string;
  href: string;
  children?: ReactNode;
  handleDelete?: () => void;
  handleCopy?: () => void;
  isCurrent?: boolean;
}) {
  return (
    <div
      className={`chart-link rounded grid grid-flow-col grid-cols-[minmax(0,1fr)_auto] items-center sm:-ml-3 ${
        isCurrent
          ? "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800"
          : "hover:bg-neutral-200 dark:hover:bg-neutral-900"
      }`}
    >
      <Link to={href} className="p-2 pl-3">
        <div className="grid gap-1">
          <span
            className={`text-lg ${
              isCurrent ? "text-blue-600 dark:text-blue-50" : ""
            }`}
          >
            {title}
          </span>
          {children}
        </div>
      </Link>
      <div className="p-2 pr-2 flex items-center chart-link-buttons sm:opacity-0">
        <button
          className="opacity-25 sm:opacity-50 hover:opacity-100 rounded transition-opacity p-1 focus:shadow-none focus:bg-neutral-300/25"
          aria-label={`Copy flowchart: ${title}`}
          onClick={handleCopy}
        >
          <Copy size={24} />
        </button>
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button
              className="opacity-25 sm:opacity-50 hover:opacity-100 rounded transition-opacity p-1 focus:shadow-none focus:bg-neutral-300/25"
              aria-label={`Delete flowchart: ${title}`}
            >
              <Trash size={24} />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="bg-foreground/50 dark:bg-background/50 data-[state=open]:animate-overlayShow fixed inset-0" />
            <Dialog.Content className="data-[state=open]:animate-contentShow bg-background text-foreground dark:bg-foreground dark:text-background fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[400px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-background p-4 shadow-lg focus:outline-none z-50 grid gap-3">
              <Dialog.Title className="text-lg font-bold">
                <Trans>Do you want to delete this?</Trans>
              </Dialog.Title>
              <Dialog.Description>
                <Trans>This action cannot be undone.</Trans>
              </Dialog.Description>
              <div className="flex gap-2 mt-6 justify-self-end">
                <Dialog.Close asChild>
                  <DialogButton icon={X}>Cancel</DialogButton>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <DialogButton icon={Trash} color="red" onClick={handleDelete}>
                    Delete
                  </DialogButton>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
});

function deleteLocalChart(
  chartId: string,
  currentChart: string,
  push: (path: string) => void
) {
  // if on this path, move to index
  if (currentChart === chartId && currentChart !== "") {
    push("/");
  }
  window.localStorage.removeItem(titleToLocalStorageKey(chartId));
}

function copyLocalChart(chart: string, push: (path: string) => void) {
  let i = 1;
  let copy = `${chart}-${i}`;
  while (window.localStorage.getItem(titleToLocalStorageKey(copy))) {
    i++;
    copy = `${chart}-${i}`;
  }
  // copy in localStorage
  const data = window.localStorage.getItem(titleToLocalStorageKey(chart));
  window.localStorage.setItem(titleToLocalStorageKey(copy), data ?? "");
  push(`/${copy}`);
}

function ProFeatureLink() {
  return (
    <div
      className={`flex items-center p-3 pt-[12px] gap-3 rounded-lg text-sm bg-neutral-200 rounded-lg dark:bg-neutral-900`}
    >
      <div className="w-[47px] sm:w-auto">
        <Sparkle
          size={30}
          className="text-blue-500 translate-y-[-1px] dark:text-orange-500"
        />
      </div>
      <div className="flex w-full flex-col items-start">
        <span>
          <Trans>Permanent Charts are a Pro Feature</Trans>
        </span>
        <Link
          to="/pricing"
          className="text-blue-500 dark:text-orange-500"
          data-testid="to-pricing"
        >
          <Trans>Learn about Flowchart Fun Pro</Trans>
        </Link>
      </div>
    </div>
  );
}
