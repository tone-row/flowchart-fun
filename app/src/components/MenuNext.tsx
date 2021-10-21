import { ReactComponent as BrandSvg } from "./brand.svg";
import { Box, BoxProps, Type } from "../slang";
import {
  TreeStructure,
  Laptop,
  Chat,
  Gear,
  Share,
  FolderOpen,
  User,
  Globe,
  Pencil,
} from "phosphor-react";
import { AppContext, Showing } from "./AppContext";
import { useContext, useRef, useState } from "react";
import styles from "./MenuNext.module.css";
import { t, Trans } from "@lingui/macro";
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
import VisuallyHidden from "@reach/visually-hidden";
import { useCurrentHostedChart, useLocalStorageText, useTitle } from "../hooks";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { queryClient, renameChart } from "../lib/queries";
import { isError, slugify, titleToLocalStorageKey } from "../lib/helpers";
import { useHistory } from "react-router";

const chartSpecific: Showing[] = ["editor", "share"];

export default function MenuNext() {
  const { showing, session } = useContext(AppContext);
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
        <MenuTabButton icon={TreeStructure} tab="editor" label={t`Editor`} />
        <MenuTabButton icon={FolderOpen} tab="navigation" label={t`Charts`} />
      </Box>
      {chartSpecific.includes(showing) ? (
        <WorkspaceSection />
      ) : (
        <Box className={styles.PageTitle} pt={5} at={{ tablet: { pt: 0 } }}>
          <Type size={1}>{translatedTitle(showing)}</Type>
        </Box>
      )}
      <Box
        content="stretch end"
        flow="column"
        items="center"
        at={{ tablet: { gap: 2, pr: 2 } }}
        className={styles.Side}
      >
        <MenuTabButton icon={Gear} tab="settings" label={t`Settings`} />
        <MenuTabButton icon={Chat} tab="feedback" label={t`Feedback`} />
        <MenuTabButton
          icon={session ? ActiveUser : User}
          tab="sponsor"
          label={t`Sponsors`}
        />
      </Box>
    </Box>
  );
}

const MenuTabButton = ({
  icon: Icon,
  tab,
  label,
  ...props
}: { icon: any; tab: Showing; label: string } & BoxProps) => {
  const { showing, setShowing } = useContext(AppContext);
  return (
    <Tooltip
      label={label}
      aria-label={label}
      className={`slang-type size-${tooltipSize}`}
    >
      <Box
        as="button"
        p={2}
        rad={1}
        role="tab"
        aria-selected={tab === showing}
        onClick={() => setShowing(tab)}
        className={styles.MenuTabButton}
        {...props}
      >
        <Icon height={33} width={33} />
        <VisuallyHidden>{label}</VisuallyHidden>
      </Box>
    </Tooltip>
  );
};

function WorkspaceSection() {
  const [title, isHosted] = useTitle();
  const Icon = isHosted ? Globe : Laptop;
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
        gap={2}
      >
        <Box
          background="color-nodeHover"
          content="center"
          className={styles.WorkspaceButtonIcon}
        >
          <Icon size={20} />
        </Box>
        <Box>
          <Type as="h1" weight="400" className={styles.WorkspaceTitle}>
            {title || "flowchart.fun"}
          </Type>
        </Box>
      </Box>
      <Box flow="column" gap={1}>
        <RenameButton />
        <ExportButton />
      </Box>
    </Box>
  );
}

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

function RenameButton() {
  const [initialName, isHosted] = useTitle();
  const { data } = useCurrentHostedChart();
  const [text] = useLocalStorageText();
  const [dialog, setDialog] = useState(false);
  const { push } = useHistory();
  const { register, handleSubmit, formState } = useForm<{ name: string }>({
    defaultValues: { name: initialName },
    mode: "onChange",
  });
  const { ref, ...rest } = register("name", {
    required: true,
    minLength: 2,
    setValueAs: (z) => (isHosted ? z : slugify(z)),
  });
  const inputRef = useRef<null | HTMLInputElement>(null);
  const rename = useMutation(
    "updateChartName",
    async ({ name }: { name: string }) => {
      if (isHosted && data) {
        await renameChart(data.id, name);
      } else {
        const oldKey = titleToLocalStorageKey(slugify(initialName));
        const newSlug = slugify(name);
        const newKey = titleToLocalStorageKey(newSlug);
        if (window.localStorage.getItem(newKey) !== null)
          throw new Error("Chart already exists");
        window.localStorage.setItem(newKey, text);
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
  return (
    <>
      <Button
        style={{ minWidth: 0 }}
        className={styles.MenuNextTitleButton}
        onClick={() => setDialog(true)}
      >
        <Pencil size={smallIconSize} />
      </Button>
      <Dialog
        dialogProps={{
          isOpen: dialog,
          onDismiss: () => setDialog(false),
          initialFocusRef: inputRef,
        }}
        innerBoxProps={{
          as: "form",
          onSubmit: handleSubmit((data) => rename.mutate(data)),
        }}
      >
        <Section>
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
            <Button
              type="submit"
              text={t`Submit`}
              disabled={!formState.isDirty || !formState.isValid}
            />
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
      at={{ tablet: { template: "auto / auto 1fr", px: 0 } }}
      onClick={() => setShareModal(true)}
    >
      <Box p={2} px={3}>
        <Share size={smallIconSize} />
      </Box>
      <Box
        display="none"
        pr={3}
        at={{ tablet: { display: "grid" } }}
        className={styles.IconButtonText}
      >
        <Type size={smallBtnTypeSize}>
          <Trans>Export</Trans>
        </Type>
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
