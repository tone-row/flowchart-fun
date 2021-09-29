import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Box, BoxProps, Type } from "../slang";
import { t, Trans } from "@lingui/macro";
import styles from "./Navigation.module.css";
import { useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router-dom";
import { AppContext } from "./AppContext";
import "@reach/dialog/styles.css";
import { Input, Page, Section, SectionTitle, Button, Dialog } from "./Shared";

const noPaddingBottom = { tablet: { pb: 0 } };
const largeGap = 10;

export default function Navigation() {
  const { setShowing } = useContext(AppContext);
  const { watch, register, handleSubmit } = useForm();
  const title = watch("chartTitle");
  const [charts, setCharts] = useState<string[]>([]);
  const { push } = useHistory();
  const { workspace = "" } = useParams<{ workspace?: string }>();
  const [erase, setErase] = useState("");
  const [copy, setCopy] = useState("");

  const onSubmit = useCallback(
    ({ chartTitle }: { chartTitle: string }) => {
      if (chartTitle) {
        push(`/${chartTitle}`);
        setShowing("editor");
      }
    },
    [push, setShowing]
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
      setShowing("editor");
      window.plausible("Copy Chart");
    },
    [copy, push, setShowing]
  );

  const handleDelete = useCallback(() => {
    // if on this path, move to index
    if (workspace === erase && workspace !== "") {
      push("/");
    }
    window.localStorage.removeItem(titleToLocalStorageKey(erase));
    setErase("");
    window.plausible("Delete Chart");
  }, [erase, push, workspace]);

  useEffect(() => {
    setCharts(
      [""]
        .concat(
          Object.keys(window.localStorage)
            .filter(
              (key) =>
                key.indexOf("flowcharts.fun:") === 0 &&
                key !== "flowcharts.fun.user.settings"
            )
            .map((file) => file.split(":")[1])
        )
        .sort()
    );
  }, [erase]);

  return (
    <Box
      px={4}
      py={8}
      at={noPaddingBottom}
      gap={largeGap}
      content="start normal"
      className={styles.Navigation}
    >
      <Page>
        <Section as="form" onSubmit={handleSubmit(onSubmit)}>
          <SectionTitle>
            <Trans>Create a New Chart</Trans>
          </SectionTitle>
          <Box template="none / 1fr auto" gap={3}>
            <Input
              {...register("chartTitle", {
                setValueAs,
              })}
            />
            <Button
              disabled={title?.length < 2 || charts.includes(title)}
              type="submit"
              onClick={() => window.plausible("Create New Chart")}
            >
              <Trans>Create</Trans>
            </Button>
          </Box>
          <Type size={-2} color="palette-white-3">
            flowchart.fun/{title}
          </Type>
        </Section>
        <Section>
          <SectionTitle>
            <Trans>Your Charts</Trans>
          </SectionTitle>
          <Box className={styles.ChartList} rad={1}>
            {charts.map((chart) => {
              const isActive = workspace === chart;
              return (
                <Box
                  key={chart}
                  className={styles.ChartWrapper}
                  template="auto auto / none"
                  at={{
                    tablet: {
                      template: "none / 1fr auto",
                      items: "stretch normal",
                    },
                  }}
                >
                  <Box
                    onClick={() => {
                      push(`/${chart}`);
                      setShowing("editor");
                    }}
                    title={chart || "Home"}
                    aria-current={isActive ? "page" : undefined}
                    as="button"
                    disabled={isActive}
                    className={styles.ChartLink}
                    p={3}
                    pb={isActive ? 1 : 3}
                    at={{ tablet: { pb: 3 } }}
                  >
                    <Type as="span" size={-1}>
                      {`/${chart}`}
                    </Type>
                  </Box>
                  {isActive && (
                    <Box
                      as="menu"
                      template="none / auto auto"
                      content="normal start"
                      at={{ tablet: { items: "normal end" } }}
                      background="color-input"
                    >
                      <SmallButton onClick={() => setCopy(chart || "/")}>
                        <Trans>Duplicate</Trans>
                      </SmallButton>
                      <SmallButton onClick={() => setErase(chart || "/")}>
                        {chart === "" ? t`Reset` : t`Delete`}
                      </SmallButton>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Section>
      </Page>
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
    </Box>
  );
}

const setValueAs = (value: string) =>
  value.replace(/[^a-z0-9]/gi, "-").toLocaleLowerCase();

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
      }}
      aria-label={t`Delete`}
      innerBoxProps={{ gap: 8 }}
    >
      <Box content="normal start" at={{ tablet: { flow: "column" } }}>
        <Type>
          {erase === "/"
            ? t`Are you sure you want to reset this?`
            : t`Are you sure you want to delete this?`}
        </Type>
        <Type weight="700" self="normal center">
          {erase}
        </Type>
      </Box>
      <Box content="normal space-between" flow="column" gap={3}>
        <Button onClick={handleDismiss}>
          <Trans>Cancel</Trans>
        </Button>
        <Button onClick={handleDelete}>
          {erase === "/" ? t`Reset` : t`Delete`}
        </Button>
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
  const { ref, ...rest } = register("chartTitle", { setValueAs });

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
      }}
      aria-label={t`Duplicate`}
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
          >
            <Trans>Create</Trans>
          </Button>
        </Box>
      </Section>
    </Dialog>
  );
}

function titleToLocalStorageKey(chartTitle: string) {
  return `flowcharts.fun${chartTitle === "/" ? "" : `:${chartTitle}`}`;
}

function SmallButton({ as = "button", children, ...props }: BoxProps) {
  return (
    <Box
      as={as}
      className={styles.MenuButton}
      px={3}
      pb={3}
      content="center"
      at={{ tablet: { pb: 0 } }}
      {...props}
    >
      <Type size={-2} as="span">
        {children}
      </Type>
    </Box>
  );
}
