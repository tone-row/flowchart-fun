import { t, Trans } from "@lingui/macro";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as Dialog from "@radix-ui/react-dialog";
import { Copy, Folder, FolderOpen, Plus, Trash, X } from "phosphor-react";
import { forwardRef, memo, ReactNode, useReducer, useState } from "react";
import { useMutation } from "react-query";
import { Link, useHistory } from "react-router-dom";

import Loading from "../components/Loading";
import { LOCAL_STORAGE_SETTINGS_KEY } from "../lib/constants";
import { titleToLocalStorageKey } from "../lib/helpers";
import { useChartId } from "../lib/hooks";
import {
  copyHostedChartById,
  deleteChart,
  queryClient,
  useHostedCharts,
} from "../lib/queries";
import { useLastChart } from "../lib/useLastChart";
// Keep these in sync (65px)
const leftColumnGrid = "grid-cols-[65px_minmax(0,1fr)]";
const leftMargin = "mx-[65px]";

export default function Charts2() {
  // write a charts reducer where the dispatch just refetches charts
  const [temporaryCharts, refetchTemporaryCharts] = useReducer(
    getTemporaryCharts,
    getTemporaryCharts()
  );
  const { data: persistentCharts, isLoading } = useHostedCharts();
  const { push } = useHistory();
  const currentChart = useChartId();
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
        <h1 className="text-4xl">Your Charts</h1>
        <Link
          to="/n"
          className="rounded-lg pl-2 pr-3 py-3 bg-foreground text-background font-bold flex items-center gap-1"
        >
          <Plus weight="bold" size={20} />
          New
        </Link>
      </header>
      <section className="grid gap-12">
        <LargeFolder
          title={t`Persistent Flowcharts`}
          description={
            <Trans>
              Access these charts from anywhere.
              <br />
              Share and embed flowcharts that stay in sync.
            </Trans>
          }
        >
          <div>
            {isLoading ? (
              <Loading />
            ) : (
              persistentCharts?.map((chart) => (
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
                >
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span>{chart.niceCreatedDate}</span>
                    <span>{chart.niceUpdatedDate}</span>
                  </div>
                </ChartLink>
              ))
            )}
          </div>
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
            <div className="grid gap-1">
              <h2 className="text-xl font-bold">{title}</h2>
              {description ? (
                <div className="text-sm text-neutral-600">{description}</div>
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
}: {
  title: string;
  href: string;
  children?: ReactNode;
  handleDelete?: () => void;
  handleCopy?: () => void;
}) {
  return (
    <div className="chart-link hover:bg-neutral-200 rounded grid grid-flow-col grid-cols-[minmax(0,1fr)_auto] items-center -ml-3">
      <Link to={href} className="p-2 pl-3">
        <div className="grid gap-1">
          <span className="text-lg">{title}</span>
          {children}
        </div>
      </Link>
      <div className="p-2 pr-2 flex items-center chart-link-buttons opacity-0">
        <button
          className="opacity-50 hover:opacity-100 rounded transition-opacity p-1 focus:shadow-none focus:bg-neutral-300"
          onClick={handleCopy}
        >
          <Copy size={24} />
        </button>
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button className="opacity-50 hover:opacity-100 rounded transition-opacity p-1 focus:shadow-none focus:bg-neutral-300">
              <Trash size={24} />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="bg-foreground/50 dark:bg-background/50 data-[state=open]:animate-overlayShow fixed inset-0" />
            <Dialog.Content className="data-[state=open]:animate-contentShow bg-background text-foreground dark:bg-foreground dark:text-background fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[300px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-background p-4 shadow-lg focus:outline-none z-50 grid gap-3">
              <Dialog.Title className="text-lg font-bold">
                <Trans>Do you want to delete this?</Trans>
              </Dialog.Title>
              <Dialog.Description>
                This action cannot be undone.
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
  let copy = `${chart}-copy-${i}`;
  while (window.localStorage.getItem(titleToLocalStorageKey(copy))) {
    i++;
    copy = `${chart}-copy-${i}`;
  }
  // copy in localStorage
  const data = window.localStorage.getItem(titleToLocalStorageKey(chart));
  window.localStorage.setItem(titleToLocalStorageKey(copy), data ?? "");
  push(`/${copy}`);
}

const buttonColors = {
  neutral:
    "bg-neutral-200 hover:bg-neutral-300 focus:ring-neutral-200 active:bg-neutral-400 text-neutral-800 hover:text-neutral-900",
  red: "bg-red-200 hover:bg-red-300 focus:ring-red-200 active:bg-red-400 text-red-800 hover:text-red-900",
  blue: "bg-blue-200 hover:bg-blue-300 focus:ring-blue-200 active:bg-blue-400 text-blue-800 hover:text-blue-900",
  orange:
    "bg-orange-200 hover:bg-orange-300 focus:ring-orange-200 active:bg-orange-400 text-orange-800 hover:text-orange-900",
  green:
    "bg-green-200 hover:bg-green-300 focus:ring-green-200 active:bg-green-400 text-green-800 hover:text-green-900",
  purple:
    "bg-purple-200 hover:bg-purple-300 focus:ring-purple-200 active:bg-purple-400 text-purple-800 hover:text-purple-900",
  zinc: "bg-zinc-200 hover:bg-zinc-300 focus:ring-zinc-200 active:bg-zinc-400 text-zinc-800 hover:text-zinc-900",
};

const DialogButton = forwardRef<
  HTMLButtonElement,
  {
    children: ReactNode;
    icon?: typeof X;
    color?: keyof typeof buttonColors;
  } & React.ComponentPropsWithoutRef<"button">
>(function DialogButton(
  { children, icon: Icon, color = "neutral", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`rounded pl-2 pr-3 py-[10px] focus:ring-2 focus:ring-offset-1 font-bold flex items-center gap-2 focus:shadow-none ${buttonColors[color]}`}
      {...props}
    >
      {Icon ? <Icon size={20} /> : null}
      <span className="translate-y-[-1px]">{children}</span>
    </button>
  );
});
