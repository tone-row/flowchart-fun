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
import { forwardRef, useContext } from "react";
import styles from "./MenuNext.module.css";
import { t, Trans } from "@lingui/macro";
import { Tooltip } from "./Shared";

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
        <Tooltip label={t`Editor`}>
          <MenuTabButton icon={TreeStructure} tab="editor" />
        </Tooltip>
        <Tooltip label={t`Charts`}>
          <MenuTabButton icon={FolderOpen} tab="navigation" />
        </Tooltip>
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
        <Tooltip label={t`User Preferences`}>
          <MenuTabButton icon={Gear} tab="settings" />
        </Tooltip>
        <Tooltip label={t`Feedback`}>
          <MenuTabButton icon={Chat} tab="feedback" />
        </Tooltip>
      </Box>
    </Box>
  );
}

type Icon = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>;

const MenuTabButton = forwardRef(
  (
    { icon: Icon, tab, ...props }: { icon: Icon; tab: Showing } & BoxProps,
    ref
  ) => {
    const { showing, setShowing } = useContext(AppContext);
    return (
      <Box
        as="button"
        p={2}
        rad={1}
        role="tab"
        aria-selected={tab === showing}
        onClick={() => setShowing(tab)}
        className={styles.MenuTabButton}
        ref={ref}
        {...props}
      >
        <Icon height={33} width={33} />
      </Box>
    );
  }
);

MenuTabButton.displayName = "MenuTabButton";

function WorkspaceSection() {
  const { workspace = "" } = useParams<{ workspace?: string }>();

  return (
    <Box
      flow="column"
      template="auto / 1fr auto"
      gap={1}
      className={styles.WorkspaceSection}
      px={1}
      at={{ tablet: { px: 0, gap: 6 } }}
    >
      <Box
        className={styles.WorkspaceButton}
        flow="column"
        items="center normal"
        template="auto / auto 1fr"
        rad={1}
        gap={3}
      >
        <Box className={styles.WorkspaceButtonIcon}>
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
