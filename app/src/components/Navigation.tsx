import {
  forwardRef,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Box, BoxProps, Type } from "../slang";
import { Trans } from "@lingui/macro";
import styles from "./Navigation.module.css";
import { useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router-dom";
import { AppContext } from "./AppContext";

const noPaddingBottom = { tablet: { pb: 0 } };
const largeGap = 10;

export default function Navigation() {
  const { setShowing } = useContext(AppContext);
  const { watch, register, handleSubmit } = useForm();
  const title = watch("chartTitle");
  const [charts, setCharts] = useState<string[]>([]);
  const { push } = useHistory();
  const { workspace = "" } = useParams<{ workspace?: string }>();

  const onSubmit = useCallback(
    ({ chartTitle }: { chartTitle: string }) => {
      if (chartTitle) {
        push(`/${chartTitle}`);
        setShowing("editor");
      }
    },
    [push, setShowing]
  );

  useEffect(() => {
    setCharts(
      Object.keys(window.localStorage)
        .filter(
          (key) =>
            key.indexOf("flowcharts.fun") === 0 &&
            key !== "flowcharts.fun.user.settings"
        )
        .map((file) => `${file.includes(":") ? file.split(":")[1] : ""}`)
        .sort()
    );
  }, []);

  return (
    <Box
      px={4}
      pb={4}
      pt={2}
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
              Create
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
                <Box
                  as="menu"
                  template="none / repeat(2, 70px)"
                  items="normal end"
                >
                  <Type size={-2} as="button" className={styles.MenuButton}>
                    Copy
                  </Type>
                  <Type size={-2} as="button" className={styles.MenuButton}>
                    Delete
                  </Type>
                </Box>
              </Box>
            ))}
          </Box>
        </Section>
      </Box>
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
