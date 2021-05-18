import {
  Dispatch,
  forwardRef,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Box, BoxProps, Type } from "../slang";
import { t, Trans } from "@lingui/macro";
import styles from "./Navigation.module.css";
import { useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router-dom";
import { AppContext } from "./AppContext";
import { Dialog } from "@reach/dialog";
import "@reach/dialog/styles.css";

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
      pb={4}
      py={2}
      at={noPaddingBottom}
      gap={largeGap}
      content="start normal"
    >
      <Box gap={10}>
        <Section as="form" onSubmit={handleSubmit(onSubmit)}>
          <Type weight="700">
            <Trans>Create a New Chart</Trans>
          </Type>
          <Box template="none / 1fr auto" gap={3}>
            <Input
              {...register("chartTitle", {
                setValueAs,
              })}
            />
            <Button
              disabled={title?.length < 2 || charts.includes(title)}
              type="submit"
            >
              <Trans>Create</Trans>
            </Button>
          </Box>
          <Type size={-2} color="palette-white-3">
            flowchart.fun/{title}
          </Type>
        </Section>
        <Section>
          <Type weight="700">
            <Trans>Your Charts</Trans>
          </Type>
          <Box>
            {charts.map((chart) => (
              <Box
                key={chart}
                className={styles.ChartWrapper}
                py={1}
                template="none / 1fr auto"
                items="center normal"
              >
                <Type
                  as="button"
                  onClick={() => push(`/${chart}`)}
                  className={styles.ChartLink}
                  aria-current={workspace === chart ? "page" : undefined}
                >
                  {chart || "/"}
                </Type>
                {workspace === chart && (
                  <Box
                    as="menu"
                    template="none / repeat(2, 70px)"
                    items="normal end"
                  >
                    <Type
                      size={-2}
                      as="button"
                      className={styles.MenuButton}
                      onClick={() => setCopy(chart || "/")}
                    >
                      <Trans>Copy</Trans>
                    </Type>
                    <Type
                      size={-2}
                      as="button"
                      className={styles.MenuButton}
                      onClick={() => setErase(chart || "/")}
                    >
                      {chart === "" ? t`Reset` : t`Delete`}
                    </Type>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Section>
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
    </Box>
  );
}

function Section({
  as = "div",
  children,
  ...props
}: { children: ReactNode } & BoxProps) {
  return (
    <Box gap={2} as={as} {...props}>
      {children}
    </Box>
  );
}

function Button({ children, ...props }: { children: ReactNode } & BoxProps) {
  return (
    <Box as="button" className={styles.Button} p={3} px={6} {...props}>
      <Type as="span">{children}</Type>
    </Box>
  );
}

const Input = forwardRef((props, ref) => {
  return (
    <Box p={3} className={styles.Input}>
      <Type as="input" autoComplete="off" type="text" ref={ref} {...props} />
    </Box>
  );
});

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
      isOpen={Boolean(erase)}
      onDismiss={handleDismiss}
      aria-label={t`Delete Chart`}
    >
      <Box gap={10}>
        <Section>
          <Type>
            {erase === "/"
              ? t`Are you sure you want to reset this?`
              : t`Are you sure you want to delete this?`}
          </Type>
          <Type weight="700" self="normal center">
            {erase}
          </Type>
        </Section>
        <Box content="normal space-between" flow="column" gap={3}>
          <Button onClick={handleDismiss}>Cancel</Button>
          <Button onClick={handleDelete}>
            {erase === "/" ? t`Reset` : t`Delete`}
          </Button>
        </Box>
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
  const { register, setValue, watch, handleSubmit } = useForm({
    defaultValues: { chartTitle: `${copy}-copy` },
  });

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
      isOpen={Boolean(copy)}
      onDismiss={handleDismiss}
      aria-label={t`Copy Chart`}
    >
      <Box gap={10} as="form" onSubmit={handleSubmit(handleCopy)}>
        <Section>
          <Type>
            <Trans>What would you like to name this copy?</Trans>
          </Type>
          <Input
            {...register("chartTitle", {
              setValueAs,
            })}
          />
        </Section>
        <Box content="normal space-between" flow="column" gap={3}>
          <Button type="button" onClick={handleDismiss}>
            <Trans>Cancel</Trans>
          </Button>
          <Button
            type="submit"
            disabled={title?.length < 2 || charts.includes(title)}
          >
            <Trans>Create</Trans>
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

function titleToLocalStorageKey(chartTitle: string) {
  return `flowcharts.fun${chartTitle === "/" ? "" : `:${chartTitle}`}`;
}
