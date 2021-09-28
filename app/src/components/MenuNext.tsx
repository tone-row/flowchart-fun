import { useParams } from "react-router-dom";
import { ReactComponent as BrandSvg } from "./brand.svg";
import { Box, BoxProps, Type } from "../slang";
import {
  TreeStructure,
  Laptop,
  Chat,
  IconProps,
  Gear,
  Share,
  FolderOpen,
} from "phosphor-react";
import { AppContext, Showing } from "./AppContext";
import { useContext } from "react";
import styles from "./MenuNext.module.css";
import { t, Trans } from "@lingui/macro";
import { Tooltip } from "./Shared";
import VisuallyHidden from "@reach/visually-hidden";

const chartSpecific: Showing[] = ["editor", "share"];

export default function MenuNext() {
  const { showing } = useContext(AppContext);
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
        p={1}
        gap={1}
        pl={2}
        at={{ tablet: { p: 0, gap: 2, pl: 0 } }}
      >
        <BrandSvg width={40} className={styles.Brand} />
        <MenuTabButton icon={TreeStructure} tab="editor" label={t`Editor`} />
        <MenuTabButton icon={FolderOpen} tab="navigation" label={t`Charts`} />
      </Box>
      {chartSpecific.includes(showing) ? (
        <WorkspaceSection />
      ) : (
        <Box className={styles.PageTitle}>
          <Type>{translatedTitle(showing)}</Type>
        </Box>
      )}
      <Box
        content="stretch end"
        flow="column"
        items="center"
        p={1}
        gap={1}
        at={{ tablet: { p: 0 } }}
      >
        <MenuTabButton icon={Gear} tab="settings" label={t`User Preferences`} />
        <MenuTabButton icon={Chat} tab="feedback" label={t`Feedback`} />
      </Box>
    </Box>
  );
}

type Icon = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>;

const MenuTabButton = ({
  icon: Icon,
  tab,
  label,
  ...props
}: { icon: Icon; tab: Showing; label: string } & BoxProps) => {
  const { showing, setShowing } = useContext(AppContext);
  return (
    <Tooltip label={label} aria-label={label} className="slang-type size--2">
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
  const { workspace = "" } = useParams<{ workspace?: string }>();

  return (
    <Box
      flow="column"
      template="auto / 1fr auto"
      gap={1}
      className={styles.WorkspaceSection}
      px={1}
      pb={1}
      items="stretch center"
      at={{ tablet: { px: 0, gap: 6, pb: 0 } }}
    >
      <Box
        className={styles.WorkspaceButton}
        flow="column"
        items="center normal"
        template="auto / auto 1fr"
        rad={1}
        gap={3}
      >
        <Box className={styles.WorkspaceButtonIcon} px={1}>
          <Laptop size={28} />
        </Box>
        <Box>
          <Type as="h1" weight="400" className={styles.WorkspaceTitle}>
            /{workspace}
          </Type>
        </Box>
      </Box>
      <ExportButton />
    </Box>
  );
}

function translatedTitle(current: Showing) {
  switch (current) {
    case "feedback":
      return t`Feedback`;
    case "settings":
      return t`User Preferences`;
    case "navigation":
      return t`Charts`;
    default:
      return current;
  }
}

function ExportButton() {
  const { setShareModal } = useContext(AppContext);

  return (
    <Box
      as="button"
      rad={1}
      py={1}
      className={styles.ExportButton}
      items="center normal"
      at={{ tablet: { template: "auto / auto 1fr" } }}
      onClick={() => setShareModal(true)}
    >
      <Box p={1} px={2}>
        <Share size={28} />
      </Box>
      <Box
        display="none"
        pr={3}
        at={{ tablet: { display: "grid" } }}
        className={styles.IconButtonText}
      >
        <Type size={-1}>
          <Trans>Export</Trans>
        </Type>
      </Box>
    </Box>
  );
}
