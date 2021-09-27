import { useParams } from "react-router-dom";
import { ReactComponent as BrandSvg } from "./brand.svg";
import { Box, Type } from "../slang";
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
        <MenuTabButton icon={TreeStructure} tab="editor" />
        <MenuTabButton icon={FolderOpen} tab="navigation" />
      </Box>
      {chartSpecific.includes(showing) ? (
        <WorkspaceSection />
      ) : (
        <Type>{translatedTitle(showing)}</Type>
      )}
      <Box
        content="stretch end"
        flow="column"
        items="center"
        p={1}
        gap={1}
        at={{ tablet: { p: 0 } }}
      >
        <MenuTabButton icon={Gear} tab="settings" />
        <MenuTabButton icon={Chat} tab="feedback" />
      </Box>
    </Box>
  );
}

type Icon = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>;

function MenuTabButton({ icon: Icon, tab }: { icon: Icon; tab: Showing }) {
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
    >
      <Icon height={33} width={33} />
    </Box>
  );
}

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
          <Laptop width={33} height={33} />
        </Box>
        <Box>
          <Type as="h1" weight="400">
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
      <Box p={2}>
        <Share />
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
