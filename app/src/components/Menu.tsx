import { Dispatch, SetStateAction, useContext } from "react";
import { LayoutContext, Showing } from "../constants";
import { Box, BoxProps, Type, TypeProps } from "../slang";
import styles from "./Menu.module.css";
import { ReactComponent as Brand } from "./brand.svg";

export default function Menu({
  setShowing,
}: {
  setShowing: Dispatch<SetStateAction<Showing>>;
}) {
  return (
    <Box className={styles.Menu} content="normal space-between" flow="column">
      <Box as="ul" flow="column" content="normal start">
        <Box
          px={4}
          py={0}
          content="center"
          style={{ fontSize: 0, lineHeight: 1 }}
          className="brand"
        >
          <Brand width={40} />
        </Box>
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
  typeProps = {},
  ...props
}: BoxProps & { children: string; show: Showing; typeProps?: TypeProps }) {
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
        disabled={isActive}
        {...props}
      >
        <Type as="span" {...typeProps}>
          {children}
        </Type>
      </Box>
    </Box>
  );
}
