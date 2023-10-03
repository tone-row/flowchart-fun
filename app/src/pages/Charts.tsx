import { Trans } from "@lingui/macro";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Copy,
  Plus,
  Sparkle,
  Trash,
  X,
  Prohibit,
  ArrowRight,
} from "phosphor-react";
import { memo, ReactNode, useContext } from "react";
import { useMutation } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import * as Popover from "@radix-ui/react-popover";

import { AppContext } from "../components/AppContext";
import Loading from "../components/Loading";
import { useIsProUser } from "../lib/hooks";
import {
  copyHostedChartById,
  deleteChart,
  queryClient,
  useHostedCharts,
} from "../lib/queries";
import { useLastChart } from "../lib/useLastChart";
import { Overlay } from "../ui/Dialog";
import { Button2, Page, popoverContentProps } from "../ui/Shared";
import { PageTitle } from "../ui/Typography";

export default function Charts() {
  const isProUser = useIsProUser();
  const customerIsLoading = useContext(AppContext).customerIsLoading;
  const { data: persistentCharts, isLoading } = useHostedCharts();
  const isLoadingAnything = isLoading || customerIsLoading;
  const navigate = useNavigate();
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
        if (result && result.id) navigate(`/u/${result.id}`);
      },
    }
  );

  const notProButHasCharts =
    !isProUser && persistentCharts && persistentCharts?.length > 0;
  return (
    <Page>
      <header className="grid md:grid-flow-col md:justify-between items-end">
        <div className="flex items-center justify-center gap-6">
          <PageTitle>
            <Trans>Your Charts</Trans>
          </PageTitle>
          <Button2
            leftIcon={<Plus size={16} />}
            onClick={() => navigate("/new")}
            color="blue"
          >
            <Trans>New</Trans>
          </Button2>
        </div>
        <SandboxLink />
      </header>
      <div className="grid gap-1">
        {isLoadingAnything ? (
          <div className="py-4">
            <Loading />
          </div>
        ) : (
          <>
            {notProButHasCharts ? (
              <InactiveAccount />
            ) : !isProUser ? (
              <ProFeatureLink />
            ) : null}
            <div className="grid gap-1">
              {persistentCharts?.map((chart) => (
                <ChartLink
                  key={chart.id}
                  title={chart.name}
                  href={`/u/${chart.id}`}
                  handleDelete={() => {
                    handleDeleteChart.mutate({ chartId: chart.id });
                  }}
                  handleCopy={() => {
                    handleCopyPersistentChart.mutate(chart.id);
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
          </>
        )}
      </div>
    </Page>
  );
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
      className={`chart-link border dark:border-neutral-700 rounded grid grid-flow-col grid-cols-[minmax(0,1fr)_auto] items-center ${
        isCurrent ? "bg-blue-50 dark:bg-blue-900" : ""
      }`}
    >
      <Link to={href} className="py-3 px-4">
        <div className="grid gap-2">
          <span
            className={`text-base ${
              isCurrent ? "text-blue-600 dark:text-blue-50" : ""
            }`}
          >
            {title}
          </span>
          {children}
        </div>
      </Link>
      <div className="p-2 pr-2 flex items-center">
        <button
          className="opacity-25 sm:opacity-50 hover:opacity-100 rounded transition-opacity p-1 focus:shadow-none focus:bg-neutral-300/25"
          aria-label={`Copy flowchart: ${title}`}
          onClick={handleCopy}
        >
          <Copy size={20} />
        </button>
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button
              className="opacity-25 sm:opacity-50 hover:opacity-100 rounded transition-opacity p-1 focus:shadow-none focus:bg-neutral-300/25"
              aria-label={`Delete flowchart: ${title}`}
            >
              <Trash size={20} />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Overlay />
            <Dialog.Content className="data-[state=open]:animate-contentShow bg-background text-foreground dark:bg-foreground dark:text-background fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[400px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-background p-4 shadow-lg focus:outline-none z-50 grid gap-3">
              <Dialog.Title className="text-lg font-bold">
                <Trans>Do you want to delete this?</Trans>
              </Dialog.Title>
              <Dialog.Description>
                <Trans>This action cannot be undone.</Trans>
              </Dialog.Description>
              <div className="flex gap-2 mt-6 justify-self-end">
                <Dialog.Close asChild>
                  <Button2 leftIcon={<X size={16} />}>Cancel</Button2>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <Button2
                    leftIcon={<Trash size={16} />}
                    color="red"
                    onClick={handleDelete}
                  >
                    Delete
                  </Button2>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
});

function ProFeatureLink() {
  return (
    <div
      className={`flex items-center p-4 pt-[15px] gap-5 rounded-lg text-sm bg-neutral-100 rounded-lg dark:bg-neutral-900`}
    >
      <div className="w-[47px] sm:w-auto">
        <Sparkle
          size={30}
          className="translate-y-[-1px] text-foreground dark:text-background"
        />
      </div>
      <div className="grid w-full gap-2 items-start">
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

function InactiveAccount() {
  return (
    <div
      className={`flex items-center p-4 pt-[15px] gap-5 rounded-lg text-sm text-red-900 bg-red-200/90 rounded-lg border-red-700 border-l-4`}
    >
      <div className="w-[47px] sm:w-auto">
        <Prohibit size={30} className="translate-y-[-1px] text-red-900" />
      </div>
      <div className="grid w-full gap-2 items-start leading-normal">
        <span>
          <Trans>
            Your charts are read-only because your account is no longer active.
            Visit your{" "}
            <Link to="/a" className="underline underline-offset-2">
              account
            </Link>{" "}
            page to learn more. You can{" "}
            <Link
              to="/pricing"
              className="underline underline-offset-2"
              data-testid="to-pricing"
            >
              upgrade to pro
            </Link>{" "}
            to regain editing access to your charts
          </Trans>
        </span>
      </div>
    </div>
  );
}

function SandboxLink() {
  return (
    <div className="grid gap-1">
      <Link
        to="/"
        className="text-purple-500 dark:text-purple-300 flex whitespace-nowrap items-center"
      >
        <Trans>Go to your Sandbox</Trans> <ArrowRight className="ml-2" />
      </Link>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className="text-xs text-neutral-400 hover:underline">
            <Trans>What's this?</Trans>
          </button>
        </Popover.Trigger>
        <Popover.Content {...popoverContentProps}>
          <p className="text-xs max-w-[210px] leading-normal text-neutral-700 dark:text-neutral-300">
            <Trans>
              Your Sandbox is a space to freely experiment with our flowchart
              tools, resetting every day for a fresh start.
            </Trans>
          </p>
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}
