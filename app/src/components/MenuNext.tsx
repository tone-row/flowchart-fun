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
      template="1fr / 1fr auto 1fr"
      flow="column"
      p={3}
      pl={5}
      items="center normal"
      className={styles.Menu}
    >
      <Box flow="column" items="center" content="stretch start" gap={2}>
        <BrandSvg width={40} className={styles.Brand} />
        <MenuTabButton icon={TreeStructure} tab="editor" />
        <MenuTabButton icon={Folder} tab="navigation" />
        <MenuTabButton icon={Gear} tab="settings" />
      </Box>
      <WorkspaceButton />
      <Box content="stretch end">
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
      rad={1}
      onClick={() => setShowing("navigation")}
      flow="column"
      items="center normal"
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
