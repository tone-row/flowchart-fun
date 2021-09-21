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
} from "phosphor-react";
import { AppContext, Showing } from "./AppContext";
import { useContext } from "react";
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
      <WorkspaceButton />
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

function WorkspaceButton() {
  const { workspace = "" } = useParams<{ workspace?: string }>();
  const { setShowing } = useContext(AppContext);

  return (
    <Box
      as="button"
      className={styles.WorkspaceButton}
      onClick={() => setShowing("navigation")}
      flow="column"
      items="center normal"
      template="auto / auto 1fr"
      at={{ tablet: { rad: 1 } }}
    >
      <Box p={2} className={styles.WorkspaceButtonIcon}>
        <Laptop width={33} height={33} />
      </Box>
      <Box px={3}>
        <Type as="h1">/{workspace}</Type>
      </Box>
    </Box>
  );
}
