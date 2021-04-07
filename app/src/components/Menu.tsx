import { Dispatch, SetStateAction, useContext } from "react";
import { LayoutContext, Showing } from "../constants";
import { Box, BoxProps, Type } from "../slang";
import styles from "./Menu.module.css";

export default function Menu({
  setShowing,
}: {
  setShowing: Dispatch<SetStateAction<Showing>>;
}) {
  return (
    <Box className={styles.Menu} content="normal space-between" flow="column">
      <Box as="ul" flow="column" content="normal start">
        <MenuButton
          show="navigation"
          onClick={() => setShowing("navigation")}
          disabled
        >
          FF
        </MenuButton>
        <MenuButton show="editor" onClick={() => setShowing("editor")}>
          Editor
        </MenuButton>
        <MenuButton show="settings" onClick={() => setShowing("settings")}>
          Settings
        </MenuButton>
        <MenuButton
          show="share"
          onClick={() => setShowing("share")}
          display={true}
          at={{ tablet: { display: false } }}
        >
          Share
        </MenuButton>
      </Box>
      <Box id="menu-right" />
    </Box>
  );
}

function MenuButton({
  children,
  show,
  ...props
}: BoxProps & { children: string; show: Showing }) {
  const { showing } = useContext(LayoutContext);
  const isActive = showing === show;
  return (
    <Box as="li">
      <Box
        as="button"
        px={4}
        py={3}
        aria-selected={isActive}
        className={styles.MenuButton}
        background="palette-white-0"
        disabled={isActive}
        {...props}
      >
        <Type>{children}</Type>
      </Box>
    </Box>
  );
}
