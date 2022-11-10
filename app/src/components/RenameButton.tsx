import { t, Trans } from "@lingui/macro";
import { ReactNode, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { useHistory } from "react-router-dom";

import { isError, slugify, titleToLocalStorageKey } from "../lib/helpers";
import {
  useCurrentHostedChart,
  useIsValidSponsor,
  useTitle,
} from "../lib/hooks";
import { makeChart, queryClient, renameChart } from "../lib/queries";
import { Box, Type } from "../slang";
import { useSession } from "./AppContext";
import {
  Button,
  Dialog,
  Input,
  Notice,
  Section,
  Tooltip,
  tooltipSize,
} from "./Shared";

export function RenameButton({
  fullText,
  children,
}: {
  fullText: string;
  children: ReactNode;
}) {
  const isValidSponsor = useIsValidSponsor();
  const session = useSession();
  const [initialName, isHosted] = useTitle();
  const { data } = useCurrentHostedChart();
  const [dialog, setDialog] = useState(false);
  const { push } = useHistory();
  const { register, handleSubmit, watch, formState } = useForm<{
    name: string;
    convertToHosted?: boolean;
  }>({
    defaultValues: { name: initialName, convertToHosted: false },
    mode: "onChange",
  });
  const convertToHosted = watch("convertToHosted");
  const currentName = watch("name");
  const { ref, ...rest } = register("name", {
    required: true,
    minLength: 2,
    setValueAs: (z) => (isHosted || convertToHosted ? z : slugify(z)),
  });
  const inputRef = useRef<null | HTMLInputElement>(null);
  const rename = useMutation(
    "updateChartName",
    async ({
      name,
      convertToHosted,
    }: {
      name: string;
      convertToHosted?: boolean;
    }) => {
      if (isHosted && data) {
        await renameChart(data.id, name);
      } else if (convertToHosted) {
        if (session?.user?.id) {
          const response = await makeChart({
            name,
            user_id: session?.user?.id,
            chart: fullText,
          });
          if (!response) throw new Error("Could not create hosted chart");
          const charts = response.data;
          if (!charts) throw new Error("Could not create hosted chart");
          const chart = charts[0];
          if (!chart) throw new Error("Could not create hosted chart");
          push(`/u/${chart.id}`);
        }
      } else {
        const oldKey = titleToLocalStorageKey(slugify(initialName));
        const newSlug = slugify(name);
        const newKey = titleToLocalStorageKey(newSlug);
        if (window.localStorage.getItem(newKey) !== null)
          throw new Error("Chart already exists");
        window.localStorage.setItem(newKey, fullText);
        push(`/${newSlug}`);
        window.localStorage.removeItem(oldKey);
      }
    },
    {
      onSuccess: () => {
        setDialog(false);
        if (isHosted) queryClient.resetQueries(["useChart"]);
      },
    }
  );
  const isValid =
    formState.isValid && (currentName !== initialName || convertToHosted);
  return (
    <>
      <Tooltip
        label={t`Rename`}
        aria-label={t`Rename`}
        className={`slang-type size-${tooltipSize}`}
      >
        <button
          data-rename-button
          onClick={() => setDialog(true)}
          aria-label={t`Rename`}
        >
          {children}
        </button>
      </Tooltip>
      <Dialog
        dialogProps={{
          isOpen: dialog,
          onDismiss: () => setDialog(false),
          initialFocusRef: inputRef,
          "aria-label": t`Rename`,
        }}
        innerBoxProps={{
          as: "form",
          onSubmit: handleSubmit((data) => rename.mutate(data)),
        }}
      >
        <Section>
          <Type as="h2" weight="400">
            <Trans>Rename</Trans>
          </Type>
          {isValidSponsor && !isHosted ? (
            <Box
              flow="column"
              gap={2}
              content="normal start"
              items="center normal"
            >
              <Type size={-1}>
                <Trans>Convert to hosted chart?</Trans>
              </Type>
              <input type="checkbox" {...register("convertToHosted")} />
            </Box>
          ) : null}
          <Input
            {...rest}
            ref={(el) => {
              ref(el);
              inputRef.current = el;
            }}
            isLoading={rename.isLoading}
          />
          <Box flow="column" content="normal space-between">
            <Button
              type="button"
              text={`Cancel`}
              onClick={() => setDialog(false)}
            />
            <Button type="submit" text={t`Submit`} disabled={!isValid} />
          </Box>
          {isError(rename.error) && <Notice>{rename.error.message}</Notice>}
        </Section>
      </Dialog>
    </>
  );
}
