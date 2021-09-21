import { useParams } from "react-router-dom";
import { ReactComponent as BrandSvg } from "./brand.svg";
import { Box, Type } from "../slang";
import {
  TreeStructure,
  Folder,
  Laptop,
  Chat,
  IconProps,
  Gear,
  Share,
} from "phosphor-react";
import { AppContext, Showing } from "./AppContext";
import { useCallback, useContext } from "react";
import styles from "./MenuNext.module.css";

export default function MenuNext() {
  return (
    <Box
      as="header"
      template="auto auto / auto [main] auto"
      at={{
        tablet: { template: "[main] auto / 1fr [main] auto 1fr", p: 3, pl: 5 },
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
        <MenuTabButton icon={Folder} tab="navigation" />
      </Box>
      <WorkspaceSection />
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
  const { setShowing } = useContext(AppContext);
  const toggle = useCallback(
    () => setShowing((s) => (s === "editor" ? "navigation" : "editor")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Box flow="column" gap={2} className={styles.WorkspaceSection}>
      <Box
        as="button"
        className={styles.WorkspaceButton}
        onClick={toggle}
        flow="column"
        items="center normal"
        template="auto / auto 1fr"
        rad={1}
      >
        <Box p={2} className={styles.WorkspaceButtonIcon}>
          <Laptop width={33} height={33} />
        </Box>
        <Box px={3}>
          <Type as="h1">/{workspace}</Type>
        </Box>
      </Box>
      <Box
        as="button"
        rad={1}
        className={styles.WorkspaceButton}
        items="center normal"
        template="auto / auto 1fr"
      >
        <Box p={2} className={styles.WorkspaceButtonIcon}>
          <Share width={33} height={33} />
        </Box>
        <Box px={3}>
          <Type size={-1}>Export</Type>
        </Box>
      </Box>
    </Box>
  );
}
