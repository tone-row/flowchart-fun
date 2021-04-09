import {
  Dispatch,
  memo,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { Box } from "../slang";
import Menu from "./Menu";
import styles from "./Layout.module.css";
import { LayoutContext, Showing } from "../constants";
import ColorMode from "./ColorMode";

const Layout = memo(
  ({
    children,
    setShowing,
  }: {
    children: ReactNode;
    setShowing: Dispatch<SetStateAction<Showing>>;
  }) => {
    const { showing } = useContext(LayoutContext);
    return (
      <>
        <Box
          root
          overflow="hidden"
          className={styles.Layout}
          template="auto minmax(0, 1fr) / none"
        >
          <Menu setShowing={setShowing} />
          <Box
            as="main"
            className={styles.TabletWrapper}
            at={{ tablet: { display: "flex", template: "none / none" } }}
            data-showing={showing}
          >
            {children}
          </Box>
        </Box>
        <ColorMode />
      </>
    );
  }
);

Layout.displayName = "Layout";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const [showing, setShowing] = useState<Showing>("editor");
  return (
    <LayoutContext.Provider value={{ showing }}>
      <Layout setShowing={setShowing}>{children}</Layout>
    </LayoutContext.Provider>
  );
}
