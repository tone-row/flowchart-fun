import { memo, ReactNode, useContext } from "react";
import { Box, BoxProps, Type } from "../slang";
import styles from "./Menu.module.css";
import { ReactComponent as BrandSvg } from "./brand.svg";
import { AppContext, Showing } from "./AppContext";
import { FiImage, FiShare2 } from "react-icons/fi";
import { Trans } from "@lingui/macro";

const hideShareButton = { tablet: { display: false } };
const showMenuRight = { tablet: { display: true } };

declare global {
  interface Window {
    plausible: (
      s: string,
      t?: { callback?: () => void; props?: Record<string, any> }
    ) => void;
  }
}

const Menu = memo(() => {
  const { shareLink, setShowing } = useContext(AppContext);
  return (
    <Box
      className={styles.Menu}
      as="header"
      content="normal space-between"
      flow="column"
    >
      <Box flow="column" content="normal start" role="tablist">
        <MenuButton
          show="navigation"
          px={4}
          py={0}
          content="center"
          style={{ fontSize: 0, lineHeight: 1 }}
          onClick={() => setShowing("navigation")}
        >
          <BrandSvg width={40} />
        </MenuButton>
        <MenuButton show="editor" onClick={() => setShowing("editor")}>
          <Type as="span">
            <Trans>Editor</Trans>
          </Type>
        </MenuButton>
        <MenuButton show="settings" onClick={() => setShowing("settings")}>
          <Type as="span">
            <Trans>Settings</Trans>
          </Type>
        </MenuButton>
        <MenuButton
          show="share"
          onClick={() => setShowing("share")}
          display={true}
          at={hideShareButton}
        >
          <Type as="span">
            <Trans>Share</Trans>
          </Type>
        </MenuButton>
      </Box>
      <Box flow="column" display={false} at={showMenuRight} pr={4} gap={10}>
        <MenuBox icon={<FiImage />}>
          <MenuRightButton
            onClick={() => {
              window.plausible("Download SVG", {
                callback: window.flowchartFunDownloadSVG,
              });
            }}
            title="Download SVG"
          >
            SVG
          </MenuRightButton>
          <MenuRightButton
            onClick={() => {
              window.plausible("Download PNG", {
                callback: window.flowchartFunDownloadPNG,
              });
            }}
            title="Download PNG"
          >
            PNG
          </MenuRightButton>
          <MenuRightButton
            onClick={() => {
              window.plausible("Download JPG", {
                callback: window.flowchartFunDownloadJPG,
              });
            }}
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
            <Trans>Share</Trans>
          </MenuRightButton>
        </MenuBox>
      </Box>
    </Box>
  );
});

Menu.displayName = "Menu";

export default Menu;

function MenuButton({
  children,
  show,
  ...props
}: BoxProps & { children: ReactNode; show: Showing }) {
  const { showing } = useContext(AppContext);
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
      {children}
    </Box>
  );
}

function MenuRightButton({
  children,
  className = "",
  ...props
}: { children: ReactNode } & BoxProps) {
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
    <Box flow="column" gap={2} className={styles.MenuBox}>
      <Box self="center">{icon}</Box>
      <Box flow="column">{children}</Box>
    </Box>
  );
}
