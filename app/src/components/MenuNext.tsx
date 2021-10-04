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
  UserCircle,
} from "phosphor-react";
import { AppContext, Showing } from "./AppContext";
import { useContext } from "react";
import styles from "./MenuNext.module.css";
import { t, Trans } from "@lingui/macro";
import {
  smallBtnTypeSize,
  smallIconSize,
  Tooltip,
  tooltipSize,
} from "./Shared";
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
          <Type>{translatedTitle(showing)}</Type>
        </Box>
      )}
      <Box
        content="stretch end"
        flow="column"
        items="center"
        at={{ tablet: { gap: 2, pr: 2 } }}
        className={styles.Side}
      >
        <MenuTabButton icon={Gear} tab="settings" label={t`User Preferences`} />
        <MenuTabButton icon={Chat} tab="feedback" label={t`Feedback`} />
        <MenuTabButton icon={UserCircle} tab="login" label={t`Log In`} />
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
  const { workspace = "" } = useParams<{ workspace?: string }>();

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
      >
        <Box
          className={styles.WorkspaceButtonIcon}
          pr={2}
          at={{ tablet: { px: 1, pr: 3 } }}
        >
          <Laptop size={smallIconSize} />
        </Box>
        <Box>
          <Type as="h1" weight="400" className={styles.WorkspaceTitle}>
            {workspace || "(-)"}
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
    case "login":
      return t`Log In`;
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
      className={styles.ExportButton}
      items="center normal"
      at={{ tablet: { template: "auto / auto 1fr", px: 0 } }}
      onClick={() => setShareModal(true)}
    >
      <Box p={1} at={{ tablet: { p: 3 } }}>
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
