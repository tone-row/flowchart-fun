import { t, Trans } from "@lingui/macro";
import VisuallyHidden from "@reach/visually-hidden";
import {
  Chat,
  CopySimple,
  FolderOpen,
  Gear,
  Globe,
  Laptop,
  PencilSimple,
  Plus,
  Question,
  Share,
  TreeStructure,
  User,
} from "phosphor-react";
import { memo, useContext, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { useHistory, useRouteMatch } from "react-router-dom";

import { gaChangeTab, gaCopyChart, gaNewChart } from "../lib/analytics";
import {
  isError,
  randomChartName,
  slugify,
  titleToLocalStorageKey,
} from "../lib/helpers";
import {
  useCurrentHostedChart,
  useIsHelp,
  useIsReadOnly,
  useIsValidSponsor,
  useTitle,
} from "../lib/hooks";
import { makeChart, queryClient, renameChart } from "../lib/queries";
import { Box, BoxProps, Type } from "../slang";
import { AppContext, Showing, useSession } from "./AppContext";
import { ReactComponent as BrandSvg } from "./brand.svg";
import styles from "./Menu.module.css";
import {
  Button,
  Dialog,
  Input,
  Notice,
  Section,
  smallBtnTypeSize,
  smallIconSize,
  Tooltip,
  tooltipSize,
} from "./Shared";

export function Menu({ fullText }: { fullText: string }) {
  const { showing, session } = useContext(AppContext);
  const { setShowing } = useContext(AppContext);
  const { push } = useHistory();
  const { url } = useRouteMatch();
  const isHelpPage = url === "/h";

  return (
    <Box
      as="header"
      template="auto auto / auto [main] auto"
      at={{
        tablet: {
          template: "[main] auto / 1fr [main] auto 1fr",
          p: 2,
          pl: 5,
          pr: 3,
          gap: 4,
        },
      }}
      flow="column"
      items="center normal"
      role="tablist"
      className={styles.Menu}
    >
      <Box
        flow="column"
        items="center"
        content="stretch start"
        pl={2}
        at={{ tablet: { p: 0, gap: 2, pl: 0 } }}
        className={styles.Side}
      >
        <Box pr={2} at={{ tablet: { pr: 0 } }}>
          <BrandSvg width={40} className={styles.Brand} />
        </Box>
        <MenuTabButton
          icon={Plus}
          label={t`New`}
          onClick={() => {
            push("/n");
            setShowing("editor");
            gaNewChart();
          }}
        />
        <MenuTabButton
          icon={TreeStructure}
          selected={"editor" === showing && !isHelpPage}
          label={t`Editor`}
          onClick={() => {
            setShowing("editor");
            isHelpPage && push("/");
            gaChangeTab({ action: "editor" });
          }}
        />
        <MenuTabButton
          icon={FolderOpen}
          selected={"navigation" === showing}
          label={t`Charts`}
          onClick={() => {
            setShowing("navigation");
            gaChangeTab({ action: "navigation" });
          }}
        />
        <MenuTabButton
          icon={session ? ActiveUser : User}
          selected={"sponsor" === showing}
          label={t`Sponsors`}
          onClick={() => {
            setShowing("sponsor");
            gaChangeTab({ action: "sponsor" });
          }}
        />
      </Box>
      {showing === "editor" ? (
        <WorkspaceSection fullText={fullText} />
      ) : (
        <Box className={styles.PageTitle} pt={5} at={{ tablet: { pt: 0 } }}>
          <Type size={1} as="h1">
            {translatedTitle(showing)}
          </Type>
        </Box>
      )}
      <Box
        content="stretch end"
        flow="column"
        items="center"
        at={{ tablet: { gap: 2, pr: 2 } }}
        className={styles.Side}
      >
        <MenuTabButton
          icon={Question}
          label={t`Help`}
          selected={"editor" === showing && isHelpPage}
          onClick={() => {
            push("/h");
            setShowing("editor");
            gaChangeTab({ action: "help" });
          }}
        />
        <MenuTabButton
          icon={Chat}
          selected={"feedback" === showing}
          label={t`Feedback`}
          onClick={() => {
            setShowing("feedback");
            gaChangeTab({ action: "feedback" });
          }}
        />
        <MenuTabButton
          icon={Gear}
          selected={"settings" === showing}
          label={t`Settings`}
          onClick={() => {
            setShowing("settings");
            gaChangeTab({ action: "settings" });
          }}
        />
      </Box>
    </Box>
  );
}

const MenuTabButton = memo(function MenuTabButton({
  icon: Icon,
  selected,
  label,
  onClick,
  ...props
}: {
  icon: any;
  selected?: boolean;
  label: string;
  onClick?: () => void;
} & BoxProps) {
  return (
    <Tooltip
      label={label}
      aria-label={label}
      className={`slang-type size-${tooltipSize}`}
    >
      <Box
        as="button"
        p={1}
        at={{ desktop: { p: 2 } }}
        rad={1}
        role="tab"
        aria-selected={selected}
        onClick={onClick}
        className={styles.MenuTabButton}
        {...props}
      >
        <Icon height={33} width={33} />
        <VisuallyHidden>{label}</VisuallyHidden>
      </Box>
    </Tooltip>
  );
});

const WorkspaceSection = memo(function WorkspaceSection({
  fullText,
}: {
  fullText: string;
}) {
  const [title, isHosted] = useTitle();
  const Icon = isHosted ? Globe : Laptop;
  const isReadOnly = useIsReadOnly();
  const isHelp = useIsHelp();
  return (
    <Box
      flow="column"
      className={styles.WorkspaceSection}
      px={1}
      py={5}
      gap={3}
      items="center"
      content="normal center"
      at={{ tablet: { px: 0, gap: 6, py: 0 } }}
    >
      <Box
        className={styles.WorkspaceButton}
        flow="column"
        items="center normal"
        template="auto / auto 1fr"
        rad={1}
        gap={1}
      >
        <Box
          content="center"
          className={styles.WorkspaceButtonIcon}
          color="color-edgeHover"
        >
          <Icon size={20} />
        </Box>
        <Box style={{ marginTop: "-1px" }}>
          <Type as="h1" weight="400" className={styles.WorkspaceTitle} size={1}>
            {title || "flowchart.fun"}
          </Type>
        </Box>
      </Box>
      <Box flow="column" gap={1}>
        {!isReadOnly && !isHelp && <RenameButton fullText={fullText} />}
        {isReadOnly ? <CloneButton fullText={fullText} /> : <ExportButton />}
      </Box>
    </Box>
  );
});

function translatedTitle(current: Showing) {
  switch (current) {
    case "feedback":
      return t`Feedback`;
    case "settings":
      return t`Settings`;
    case "navigation":
      return t`Charts`;
    case "sponsor":
      return t`Sponsors`;
    default:
      return current;
  }
}

function RenameButton({ fullText }: { fullText: string }) {
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
        <Button
          style={{ minWidth: 0 }}
          onClick={() => setDialog(true)}
          aria-label={t`Rename`}
        >
          <PencilSimple size={smallIconSize} />
        </Button>
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

function ExportButton() {
  const { setShareModal } = useContext(AppContext);

  return (
    <Box
      as="button"
      rad={1}
      className={[styles.ExportButton, styles.MenuNextTitleButton].join(" ")}
      items="center normal"
      aria-label="Open Export Dialog"
      at={{ tablet: { template: "auto / auto 1fr", px: 0 } }}
      onClick={() => {
        setShareModal(true);
      }}
    >
      <Box p={2} px={3}>
        <Share size={smallIconSize} />
      </Box>
      <Box display="none" pr={3} at={{ tablet: { display: "grid" } }}>
        <Type size={smallBtnTypeSize} weight="700" color="palette-white-0">
          <Trans>Export</Trans>
        </Type>
      </Box>
    </Box>
  );
}

/** Allow users to copy read-only charts */
export function CloneButton({ fullText }: { fullText: string }) {
  const { push } = useHistory();
  return (
    <Box
      as="button"
      rad={1}
      className={[styles.ExportButton, styles.MenuNextTitleButton].join(" ")}
      items="center normal"
      at={{ tablet: { template: "auto / auto 1fr", px: 0 } }}
      aria-label={t`Clone`}
      onClick={() => {
        const newChartTitle = randomChartName();
        window.localStorage.setItem(
          titleToLocalStorageKey(newChartTitle),
          fullText ?? ""
        );
        push(`/${newChartTitle}`);
        gaCopyChart();
      }}
    >
      <Box p={2} px={3}>
        <CopySimple size={smallIconSize} />
      </Box>
    </Box>
  );
}

function ActiveUser(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 33 33"
      className={styles.ActiveUser}
      {...props}
    >
      <defs>
        <clipPath id="prefix__a17d60b4-e0f8-43b3-a564-04fa6e03ba61">
          <path
            className="prefix__b04d3312-aa75-43f2-ab63-2c3f069f959a"
            d="M9.37 5.37H23.5V19.5H9.37z"
          />
        </clipPath>
        <clipPath id="prefix__b352e344-bd63-4a79-9034-37b75fb29d2b">
          <path
            className="prefix__b04d3312-aa75-43f2-ab63-2c3f069f959a"
            d="M9.37 5.37H22.5V18.5H9.37z"
          />
        </clipPath>
        <clipPath id="prefix__e21ef387-74b1-4a51-ae3f-6daeab19301d">
          <path
            className="prefix__b04d3312-aa75-43f2-ab63-2c3f069f959a"
            d="M10.37 5.37H23.5V18.5H10.37z"
          />
        </clipPath>
        <style>
          {".prefix__b04d3312-aa75-43f2-ab63-2c3f069f959a{fill:none}"}
        </style>
      </defs>
      <g id="prefix__ff580aca-8ff2-475d-af97-318c8e2d48d0" data-name="Layer 2">
        <g
          id="prefix__ba6ea03b-2d28-4d9a-8170-a5e80ab0409c"
          data-name="Layer 1"
        >
          <path
            className="prefix__b04d3312-aa75-43f2-ab63-2c3f069f959a ignore"
            d="M0 0h33v33H0z"
          />
          <circle
            cx={16.5}
            cy={12.38}
            r={8.25}
            strokeMiterlimit={1.29}
            stroke="var(--color-foreground)"
            fill="none"
          />
          <path
            d="M4 27.84a14.46 14.46 0 0125 0"
            strokeLinecap="round"
            strokeLinejoin="round"
            stroke="var(--color-foreground)"
            fill="none"
          />
          <g clipPath="url(#prefix__a17d60b4-e0f8-43b3-a564-04fa6e03ba61)">
            <path
              d="M11.61 12.33a4.83 4.83 0 009.65 0"
              stroke="var(--color-foreground)"
              fill="none"
            />
          </g>
          <g clipPath="url(#prefix__b352e344-bd63-4a79-9034-37b75fb29d2b)">
            <path
              d="M13.3 10.49a.89.89 0 100-1.77.89.89 0 000 1.77"
              className="eyes ignore"
              fill="var(--color-foreground)"
            />
          </g>
          <g clipPath="url(#prefix__e21ef387-74b1-4a51-ae3f-6daeab19301d)">
            <path
              d="M19.56 10.49a.89.89 0 100-1.77.89.89 0 000 1.77"
              className="eyes ignore"
              fill="var(--color-foreground)"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
