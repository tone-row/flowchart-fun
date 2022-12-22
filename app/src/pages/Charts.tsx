import { t, Trans } from "@lingui/macro";
import { formatDistanceStrict, parseISO } from "date-fns";
import { Check, Copy, Trash } from "phosphor-react";
import {
  Dispatch,
  Fragment,
  memo,
  ReactNode,
  SetStateAction,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { Link, useHistory, useParams } from "react-router-dom";

import { AppContext } from "../components/AppContext";
import Loading from "../components/Loading";
import {
  Button,
  Dialog,
  Input,
  Notice,
  Section,
  SectionTitle,
} from "../components/Shared";
import { LOCAL_STORAGE_SETTINGS_KEY } from "../lib/constants";
import { slugify, titleToLocalStorageKey } from "../lib/helpers";
import { useIsValidCustomer, useIsValidSponsor } from "../lib/hooks";
import {
  deleteChart,
  makeChart,
  queryClient,
  useChart,
  useHostedCharts,
} from "../lib/queries";
import { useLastChart } from "../lib/useLastChart";
import { Box, Type } from "../slang";
import styles from "./Charts.module.css";

export default function Charts() {
  const validCustomer = useIsValidCustomer();
  const customerIsLoading = useContext(AppContext).customerIsLoading;
  // Still checking session
  return (
    <Box
      px={5}
      py={8}
      gap={5}
      content="start normal"
      className={styles.Navigation}
    >
      {customerIsLoading ? (
        <Loading />
      ) : validCustomer ? (
        <HostedCharts />
      ) : (
        <HostedChartsCallout />
      )}
      <LocalCharts />
    </Box>
  );
}
type Fields = {
  chartTitle: string;
};
function LocalCharts() {
  const { watch, register, handleSubmit } = useForm<Fields>();
  const title = watch("chartTitle");
  const [charts, setCharts] = useState<string[]>([]);
  const { push } = useHistory();
  const { workspace = undefined } = useParams<{ workspace?: string }>();
  const [erase, setErase] = useState("");
  const [copy, setCopy] = useState("");

  const onSubmit = useCallback(
    ({ chartTitle }: Fields) => {
      if (chartTitle) {
        push(`/${chartTitle}`);
      }
    },
    [push]
  );

  const handleCopy = useCallback(
    ({ chartTitle }: { chartTitle: string }) => {
      // copy in localStorage
      const data = window.localStorage.getItem(titleToLocalStorageKey(copy));
      window.localStorage.setItem(
        titleToLocalStorageKey(chartTitle),
        data ?? ""
      );
      push(`/${chartTitle}`);
      setCopy("");
    },
    [copy, push]
  );

  const handleDelete = useCallback(() => {
    // if on this path, move to index
    if (workspace === erase && workspace !== "") {
      push("/");
    }
    window.localStorage.removeItem(titleToLocalStorageKey(erase));
    setErase("");
  }, [erase, push, workspace]);

  useEffect(() => {
    setCharts(
      [""]
        .concat(
          Object.keys(window.localStorage)
            .filter(
              (key) =>
                key.indexOf("flowcharts.fun:") === 0 &&
                key !== LOCAL_STORAGE_SETTINGS_KEY
            )
            .map((file) => file.split(":")[1])
        )
        .sort()
    );
  }, [erase]);

  const lastChart = useLastChart((s) => s.lastChart);

  return (
    <Section className={styles.ChartSection}>
      <TitleAndSummary title={t`Local Charts`}>
        <Trans>
          These charts are only available in this browser on this device.
          <br />
          Clearing your browser {"local storage"} will erase these.
        </Trans>
      </TitleAndSummary>
      <Section as="form" onSubmit={handleSubmit(onSubmit)}>
        <Box gap={1}>
          <Box template="none / 1fr auto" gap={3}>
            <Input
              placeholder={t`Enter a title`}
              {...register("chartTitle", {
                setValueAs: slugify,
              })}
            />
            <Button
              disabled={title?.length < 2 || charts.includes(title)}
              type="submit"
              text={t`Create`}
            />
          </Box>
          <Type size={-2} color="palette-white-3">
            flowchart.fun/{title}
          </Type>
        </Box>
      </Section>
      <Box gap={1} template="auto / minmax(0,1fr) repeat(2, 42px)">
        <LocalChartListTitles />
        {charts
          ?.filter((c) => c !== "h")
          .map((chart) => {
            const href = `/${chart}`;
            const isActive = lastChart === href;
            return (
              <Fragment key={chart}>
                <Button
                  as={Link}
                  to={`/${chart}`}
                  className={styles.NewChartLink}
                  content="normal start"
                  items="center stretch"
                  gap={2}
                  aria-current={isActive ? "location" : undefined}
                >
                  <Type as="span" size={-1}>
                    {`/${chart}`}
                  </Type>
                </Button>
                <Button
                  className={styles.IconButton}
                  onClick={() => setCopy(chart || "/")}
                >
                  <Copy />
                </Button>
                <Button
                  aria-label={`Delete "${chart}"`}
                  className={styles.IconButton}
                  onClick={() => setErase(chart || "/")}
                >
                  <Trash />
                </Button>
              </Fragment>
            );
          })}
      </Box>
      <DeleteChart
        erase={erase}
        setErase={setErase}
        handleDelete={handleDelete}
      />
      <CopyChart
        copy={copy}
        setCopy={setCopy}
        charts={charts}
        handleCopy={handleCopy}
      />
    </Section>
  );
}

function DeleteChart({
  erase,
  setErase,
  handleDelete,
}: {
  erase: string;
  setErase: Dispatch<SetStateAction<string>>;
  handleDelete: () => void;
}) {
  const handleDismiss = useCallback(() => {
    setErase("");
  }, [setErase]);

  return (
    <Dialog
      dialogProps={{
        isOpen: Boolean(erase),
        onDismiss: handleDismiss,
        "aria-label": t`Delete`,
      }}
      innerBoxProps={{ gap: 8 }}
    >
      <Box content="normal start" gap={2} at={{ tablet: { flow: "column" } }}>
        <Type>{erase === "/" ? t`Reset` : t`Delete`}</Type>
        <Type weight="700" self="normal center">
          flowchart.fun/{erase}
        </Type>
      </Box>
      <Box content="normal space-between" flow="column" gap={3}>
        <Button onClick={handleDismiss} text={t`Cancel`} />
        <Button
          onClick={handleDelete}
          text={erase === "/" ? t`Reset` : t`Delete`}
        />
      </Box>
    </Dialog>
  );
}

function CopyChart({
  copy,
  setCopy,
  handleCopy,
  charts,
}: {
  copy: string;
  setCopy: Dispatch<SetStateAction<string>>;
  handleCopy: (data: { chartTitle: string }) => void;
  charts: string[];
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { register, setValue, watch, handleSubmit } = useForm({
    defaultValues: { chartTitle: `${copy}-copy` },
  });
  const { ref, ...rest } = register("chartTitle", { setValueAs: slugify });

  const title = watch("chartTitle");

  const handleDismiss = useCallback(() => {
    setCopy("");
  }, [setCopy]);

  useEffect(() => {
    setValue(
      "chartTitle",
      [copy === "/" ? "" : copy, "copy"].filter(Boolean).join("-")
    );
  }, [copy, setValue]);

  return (
    <Dialog
      dialogProps={{
        isOpen: Boolean(copy),
        onDismiss: handleDismiss,
        initialFocusRef: inputRef,
        "aria-label": t`Duplicate`,
      }}
      innerBoxProps={{
        gap: 10,
        as: "form",
        onSubmit: handleSubmit(handleCopy),
      }}
    >
      <Section>
        <Type>
          <Trans>What would you like to name this copy?</Trans>
        </Type>
        <Box template="none / minmax(0, 1fr) auto" gap={3}>
          <Input
            ref={(r) => {
              inputRef.current = r;
              ref(r);
            }}
            {...rest}
            name="chartTitle"
          />
          <Button
            type="submit"
            disabled={title?.length < 2 || charts.includes(title)}
            text={t`Create`}
          />
        </Box>
      </Section>
    </Dialog>
  );
}
type CreateNewFields = {
  name: string;
};
function HostedCharts() {
  const validSponsor = useIsValidSponsor();
  const { session } = useContext(AppContext);
  const { push } = useHistory();
  const { mutate, isLoading } = useMutation("makeChart", makeChart, {
    onSuccess: (response: any) => {
      queryClient.invalidateQueries(["auth", "hostedCharts"]);
      push(`/u/${response.data[0].id}`);
    },
  });
  const { data: charts } = useHostedCharts();
  const { register, watch, handleSubmit } = useForm<CreateNewFields>();
  const name = watch("name");

  const onSubmit = useCallback(
    ({ name }: CreateNewFields) => {
      session?.user?.id && mutate({ name, user_id: session?.user?.id });
    },
    [mutate, session?.user?.id]
  );
  const [copyModal, setCopyModal] = useState<false | number>(false);
  const [deleteModal, setDeleteModal] = useState<
    false | { id: number; name: string }
  >(false);

  return (
    <Section content="start normal" className={styles.ChartSection}>
      <TitleAndSummary title={t`Hosted Charts`}>
        <Trans>
          Access these charts from anywhere.
          <br />
          Share/embed charts that stay in sync with your edits.
        </Trans>
      </TitleAndSummary>
      {validSponsor ? (
        <Section as="form" onSubmit={handleSubmit(onSubmit)}>
          <Box template="none / 1fr auto" gap={3}>
            <Input
              placeholder={t`Enter a title`}
              {...register("name", { required: true })}
              disabled={isLoading}
              isLoading={isLoading}
            />
            <Button
              disabled={!name || isLoading}
              type="submit"
              text={t`Create`}
            />
          </Box>
        </Section>
      ) : (
        <Notice boxProps={{ as: Link, to: "/a" }}>
          <Trans>
            Your subscription is no longer active. If you want to create and
            edit hosted charts become a sponsor.
          </Trans>
        </Notice>
      )}
      <Box
        gap={1}
        template={
          validSponsor ? "auto / minmax(0, 1fr) repeat(2, 42px)" : "auto / auto"
        }
      >
        <HostedChartListTitles />
        {charts?.map((chart) => (
          <ChartButton
            key={chart.id}
            chartId={chart.id}
            chartName={chart.name}
            setCopyModal={setCopyModal}
            setDeleteModal={setDeleteModal}
            is_public={chart.is_public}
            created_at={chart.created_at}
            updated_at={chart.updated_at}
          />
        ))}
      </Box>
      <CopyHostedChart
        isOpen={copyModal}
        onDismiss={() => setCopyModal(false)}
      />
      <DeleteHostedChart
        isOpen={deleteModal}
        onDismiss={() => setDeleteModal(false)}
      />
    </Section>
  );
}

function TitleAndSummary({
  title,
  children: summary,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box gap={2}>
      <SectionTitle>{title}</SectionTitle>
      <Box>
        <Type>{summary}</Type>
      </Box>
    </Box>
  );
}

const f = (s: string) => formatDistanceStrict(parseISO(s), new Date());

function CopyHostedChart({
  isOpen,
  onDismiss,
}: {
  isOpen: boolean | number;
  onDismiss: () => void;
}) {
  return (
    <Dialog
      dialogProps={{
        isOpen: typeof isOpen === "number",
        onDismiss,
        "aria-label": t`Copy`,
      }}
      innerBoxProps={{}}
    >
      <Suspense fallback={<Loading />}>
        <CopyHostedChartInner isOpen={isOpen} onDismiss={onDismiss} />
      </Suspense>
    </Dialog>
  );
}
type CopyHostedFields = {
  name: string;
};
function CopyHostedChartInner({
  isOpen,
  onDismiss,
}: {
  isOpen: boolean | number;
  onDismiss: () => void;
}) {
  const { register, handleSubmit, watch } = useForm<CopyHostedFields>();
  const copyName = watch("name");
  const { push } = useHistory();
  const newChart = useMutation("makeChart", makeChart, {
    onSuccess: (response: any) => {
      queryClient.invalidateQueries(["auth", "hostedCharts"]);
      push(`/u/${response.data[0].id}`);
      onDismiss();
    },
  });
  const { data: chart } = useChart(
    typeof isOpen === "number" ? isOpen.toString() : ""
  );
  const { session } = useContext(AppContext);

  function onSubmit({ name }: CopyHostedFields) {
    if (chart && session?.user?.id) {
      newChart.mutate({
        name,
        user_id: session?.user.id,
        chart: chart.chart,
      });
    }
  }

  const inputRef = useRef<null | HTMLInputElement>(null);
  const { ref, ...rest } = register("name", { required: true });
  useLayoutEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

  return newChart.isLoading || !chart ? (
    <Loading />
  ) : (
    <Section as="form" onSubmit={handleSubmit(onSubmit)}>
      <Type>
        <Trans>Duplicate</Trans>{" "}
        <Type color="color-highlightColor" as="span">
          {chart.name}
        </Type>
      </Type>
      <Input
        placeholder={t`Enter a title`}
        {...rest}
        ref={(el) => {
          ref(el);
          inputRef.current = el;
        }}
      />
      <Box content="normal space-between" flow="column">
        <Button onClick={onDismiss} type="button" text={t`Cancel`} />
        <Button disabled={!copyName} type="submit" text={t`Copy`} />
      </Box>
    </Section>
  );
}

function DeleteHostedChart({
  isOpen,
  onDismiss,
}: {
  isOpen: false | { id: number; name: string };
  onDismiss: () => void;
}) {
  const { handleSubmit } = useForm();
  const { push } = useHistory();
  const deleteChatMutation = useMutation("deleteChart", deleteChart, {
    onSuccess: () => {
      queryClient.invalidateQueries(["auth", "hostedCharts"]);
      push(`/`);
      onDismiss();
    },
  });
  function onSubmit() {
    if (isOpen !== false) {
      deleteChatMutation.mutate({
        chartId: isOpen.id,
      });
    }
  }
  return (
    <Dialog
      dialogProps={{
        isOpen: isOpen !== false,
        onDismiss,
        "aria-label": t`Copy`,
      }}
      innerBoxProps={{}}
    >
      {deleteChatMutation.isLoading ? (
        <Loading />
      ) : (
        <Section as="form" onSubmit={handleSubmit(onSubmit)}>
          <Type>
            <Trans>Do you want to delete this?</Trans>{" "}
            <Type color="color-highlightColor" as="span">
              {isOpen && isOpen.name}
            </Type>
          </Type>
          <Box content="normal space-between" flow="column">
            <Button onClick={() => onDismiss()} text={t`Cancel`} />
            <Button type="submit" text={t`Delete`} />
          </Box>
        </Section>
      )}
    </Dialog>
  );
}

function HostedChartListTitles() {
  const validSponsor = useIsValidSponsor();
  return (
    <>
      <Box
        template="auto / minmax(0,1fr) repeat(1, 110px)"
        at={{
          tablet: {
            template: "auto / minmax(0,1fr) 40px repeat(2, 110px)",
          },
        }}
        px={3}
        gap={2}
        className={styles.LinkColumnTitles}
      >
        <Type size={-2} as="span">
          <Trans>Name</Trans>
        </Type>
        <Box display="none" at={{ tablet: { display: "block" } }}>
          <Type size={-2}>
            <Trans>Public</Trans>
          </Type>
        </Box>
        <Type size={-2} as="span">
          <Trans>Updated</Trans>
        </Type>
        <Box display="none" at={{ tablet: { display: "block" } }}>
          <Type size={-2}>
            <Trans>Created</Trans>
          </Type>
        </Box>
      </Box>
      {validSponsor ? (
        <>
          <div />
          <div />
        </>
      ) : null}
    </>
  );
}

function LocalChartListTitles() {
  return (
    <>
      <Box
        template="auto / auto"
        px={3}
        gap={2}
        className={styles.LinkColumnTitles}
      >
        <Type size={-2} as="span">
          <Trans>Name</Trans>
        </Type>
      </Box>
      <div />
      <div />
    </>
  );
}

const ChartButton = memo(function ChartButton({
  chartId,
  chartName,
  is_public,
  updated_at,
  created_at,
  setCopyModal,
  setDeleteModal,
}: {
  chartId: number;
  chartName: string;
  is_public: boolean;
  updated_at: string;
  created_at: string;
  id?: string;
  setCopyModal: any;
  setDeleteModal: any;
}) {
  const validSponsor = useIsValidSponsor();
  const lastChart = useLastChart((s) => s.lastChart);
  const href = `/u/${chartId}`;
  const isActive = lastChart === href;
  return (
    <>
      <Button
        as={Link}
        to={href}
        className={styles.NewChartLink}
        content="normal start"
        items="center stretch"
        template="auto / minmax(0,1fr) repeat(1, 110px)"
        at={{
          tablet: {
            template: "auto / minmax(0,1fr) 40px repeat(2, 110px)",
          },
        }}
        gap={2}
        aria-current={isActive ? "location" : undefined}
        title={chartName}
      >
        <Type as="span" size={-1}>
          {chartName}
        </Type>
        <Box
          display="none"
          at={{ tablet: { display: "block" } }}
          self="normal end"
        >
          {is_public ? <Check /> : <div />}
        </Box>
        <Type as="span" size={-2} className={styles.NewChartLinkSubtext}>
          {f(updated_at)} ago
        </Type>
        <Box display="none" at={{ tablet: { display: "block" } }}>
          <Type size={-2} className={styles.NewChartLinkSubtext}>
            {f(created_at)} ago
          </Type>
        </Box>
      </Button>
      {validSponsor ? (
        <>
          <Button
            className={styles.IconButton}
            onClick={() => setCopyModal(chartId)}
          >
            <Copy />
          </Button>
          <Button
            className={styles.IconButton}
            onClick={() => setDeleteModal({ id: chartId, name: chartName })}
          >
            <Trash />
          </Button>
        </>
      ) : null}
    </>
  );
});

function HostedChartsCallout() {
  const { push } = useHistory();
  return (
    <Box gap={8} items="start">
      <Box gap={4} items="start">
        <Box gap={2}>
          <SectionTitle>
            <Trans>Hosted Charts</Trans>
          </SectionTitle>
          <Type className={styles.CalloutInner} style={{ maxWidth: 400 }}>
            <Trans>
              Sponsor flowchart.fun for $3 / month or $30 / year to access
              hosted flowcharts and the newest styles and features
            </Trans>
          </Type>
        </Box>
        <Button
          className={styles.BlueButton}
          p={3}
          px={6}
          typeProps={{ size: 0 }}
          text={t`Learn More`}
          onClick={() => {
            push("/sponsor");
          }}
        />
      </Box>
      <img
        src="/images/flowchart-person.svg"
        alt="Person making a flowchart"
        className={styles.FlowchartPerson}
      />
    </Box>
  );
}
