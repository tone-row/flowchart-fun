import { Dispatch, memo, ReactNode, SetStateAction, useContext } from "react";
import { Box, BoxProps, Type, TypeProps } from "../slang";
import styles from "./Menu.module.css";
import { ReactComponent as BrandSvg } from "./brand.svg";
import { AppContext } from "./AppContext";
import { LayoutContext, Showing } from "./Layout";
import { FiDownload, FiShare2 } from "react-icons/fi";

const hideShareButton = { tablet: { display: false } };
const showMenuRight = { tablet: { display: true } };

const Menu = memo(
  ({ setShowing }: { setShowing: Dispatch<SetStateAction<Showing>> }) => {
    const { shareLink } = useContext(AppContext);
    return (
      <Box
        className={styles.Menu}
        as="header"
        content="normal space-between"
        flow="column"
      >
        <Box flow="column" content="normal start" role="tablist">
          <Box
            px={4}
            py={0}
            content="center"
            style={{ fontSize: 0, lineHeight: 1 }}
            className="brand"
          >
            <BrandSvg width={40} />
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
            at={hideShareButton}
          >
            Share
          </MenuButton>
        </Box>
        <Box flow="column" display={false} at={showMenuRight} pr={4} gap={6}>
          <MenuBox icon={<FiDownload />}>
            <MenuRightButton
              onClick={() => window.flowchartFunDownloadSVG()}
              title="Download SVG"
            >
              SVG
            </MenuRightButton>
            <MenuRightButton
              onClick={() => window.flowchartFunDownloadPNG()}
              title="Download PNG"
            >
              PNG
            </MenuRightButton>
            <MenuRightButton
              onClick={() => window.flowchartFunDownloadJPG()}
              title="Download JPG"
            >
              JPG
            </MenuRightButton>
          </MenuBox>
          <MenuBox icon={<FiShare2 />}>
            <MenuRightButton
              as="a"
              className={styles.TypeLink}
              target="_blank"
              rel="noreferrer"
              href={shareLink}
              title="Open Read-only Link for Sharing"
            >
              Share
            </MenuRightButton>
          </MenuBox>
        </Box>
      </Box>
    );
  }
);

Menu.displayName = "Menu";

export default Menu;

function MenuButton({
  children,
  show,
  typeProps = {},
  ...props
}: BoxProps & { children: string; show: Showing; typeProps?: TypeProps }) {
  const { showing } = useContext(LayoutContext);
  const isActive = showing === show;
  return (
    <Box
      as="button"
      px={4}
      py={3}
      role="tab"
      aria-selected={isActive}
      className={styles.MenuButton}
      disabled={isActive}
      {...props}
    >
      <Type as="span" {...typeProps}>
        {children}
      </Type>
    </Box>
  );
}

function MenuRightButton({
  children,
  className = "",
  ...props
}: { children: string } & BoxProps) {
  return (
    <Box
      as="button"
      content="center"
      px={2}
      className={[styles.menuRightButton, className].join(" ")}
      {...props}
    >
      <Type>{children}</Type>
    </Box>
  );
}

function MenuBox({
  children,
  icon,
}: {
  children: ReactNode;
  icon: JSX.Element;
}) {
  return (
    <Box flow="column" gap={3} className={styles.MenuBox}>
      <Box self="center">{icon}</Box>
      <Box flow="column">{children}</Box>
    </Box>
  );
}
